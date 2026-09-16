import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";
import { sendMail } from "@/lib/email";
import { wrapEmail } from "@/lib/mail-template";
import { validatePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await ctx.params;
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`form-${ip}-${key}`, 10, 10 * 60 * 1000);
    if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many requests.");

    const service = createServiceClient();
    const { data: form } = await service.from("forms").select("*").eq("key", key).eq("is_active", true).maybeSingle();
    if (!form) throw new ApiError(404, "form_not_found");

    const { data: fields } = await service
      .from("form_fields")
      .select("*")
      .eq("form_id", form.id)
      .eq("is_active", true)
      .order("display_order");

    const fd = await req.formData();
    const values: Record<string, unknown> = {};

    for (const f of fields ?? []) {
      const raw = fd.get(f.name);
      if (raw instanceof File) {
        // Upload file to storage
        const safeName = raw.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `submissions/${Date.now()}-${safeName}`;
        const { error } = await service.storage.from("submissions").upload(path, raw, { contentType: raw.type });
        if (!error) {
          const { data: pub } = service.storage.from("submissions").getPublicUrl(path);
          values[f.name] = pub.publicUrl;
        }
        continue;
      }
      const str = String(raw ?? "");
      if (f.field_type === "phone") {
        try {
          values[f.name] = JSON.parse(str);
        } catch {
          values[f.name] = str;
        }
      } else if (f.field_type === "multiselect") {
        values[f.name] = str ? str.split(",") : [];
      } else if (f.field_type === "checkbox" || f.field_type === "consent") {
        values[f.name] = str === "true" || str === "on";
      } else {
        values[f.name] = str;
      }
    }

    // Server-side validation
    for (const f of fields ?? []) {
      const v = values[f.name];
      if (f.required) {
        const empty = v === "" || v === null || v === undefined || v === false || (Array.isArray(v) && v.length === 0);
        if (empty) throw new ApiError(422, "validation_error", `${f.name} is required`);
      }
      if (f.field_type === "phone" && v && typeof v === "object") {
        const pv = v as { country_code?: string; national_number?: string };
        if (pv.national_number) {
          const check = validatePhone(pv.country_code ?? "JO", pv.national_number);
          if (!check.valid) throw new ApiError(422, "invalid_phone", "Invalid phone number");
        }
      }
    }

    await service.from("form_submissions").insert({
      form_key: key,
      data: values as Record<string, unknown>,
      meta: { ip },
    });

    // Map to typed tables for existing admin dashboards.
    const v = values;
    const name = String(v.name ?? "");
    const email = (String(v.email ?? "") || null) as string | null;
    const message = (String(v.message ?? "") || null) as string | null;
    const phoneObj = v.phone as { international_number?: string; country_code?: string; dial_code?: string; national_number?: string } | undefined;

    if (key === "appointment") {
      await service.from("appointments").insert({
        name,
        phone: phoneObj?.international_number || String(v.phone ?? ""),
        email,
        country_code: phoneObj?.country_code ?? null,
        dial_code: phoneObj?.dial_code ?? null,
        national_number: phoneObj?.national_number ?? null,
        international_number: phoneObj?.international_number ?? null,
        category_id: (v.category as string) || null,
        service_id: (v.service as string) || null,
        doctor_id: (v.doctor as string) || null,
        preferred_date: (v.preferred_date as string) || null,
        preferred_time: (v.preferred_time as string) || null,
        message,
        consent: Boolean(v.consent),
        status: "new",
      });
    } else if (key === "contact") {
      await service.from("contact_messages").insert({
        name,
        phone: phoneObj?.international_number || String(v.phone ?? "") || null,
        email,
        subject: (String(v.subject ?? "") || null) as string | null,
        message: message ?? "",
      });
    }

    await service.from("notifications").insert({
      type: key === "appointment" ? "appointment" : "contact",
      title_ar: key === "appointment" ? "موعد جديد" : "رسالة جديدة",
      title_en: key === "appointment" ? "New appointment" : "New message",
      message_ar: `${key === "appointment" ? "طلب موعد جديد" : "رسالة جديدة"} من ${name}`,
      message_en: `${key === "appointment" ? "New appointment" : "New message"} from ${name}`,
    });

    // Email notification to admin
    if (form.notify_enabled && form.notify_email) {
      const rows = Object.entries(values)
        .map(([k2, val]) => `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;color:#475569;font-weight:600;">${k2}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${typeof val === "object" ? JSON.stringify(val) : String(val)}</td></tr>`)
        .join("");
      await sendMail({
        to: form.notify_email,
        subject: `${key === "appointment" ? "موعد جديد" : "رسالة جديدة"} — ${form.name_ar ?? key}`,
        html: await wrapEmail(
          form.name_ar ?? key,
          `<table style="border-collapse:collapse;width:100%;font-size:14px;">${rows}</table>`,
        ),
      });
    }

    // Thank-you email to the customer
    if (email) {
      await sendMail({
        to: email,
        subject: key === "appointment" ? "تم استلام طلب حجز موعدك" : "تم استلام رسالتك",
        html: await wrapEmail(
          key === "appointment" ? `مرحبًا ${name}` : `مرحبًا ${name}`,
          `<p>شكرًا لتواصلك معنا. ${key === "appointment" ? "تم استلام طلب حجز موعدك بنجاح وسيتواصل معك فريقنا قريبًا لتأكيد الموعد." : "تم استلام رسالتك بنجاح وسيتم الرد عليك في أقرب وقت."}</p>`,
        ),
      });
    }

    return jsonOk({ ok: true }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
