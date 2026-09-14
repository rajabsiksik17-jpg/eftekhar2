import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";
import { appointmentSchema } from "@/lib/validation";
import { validatePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`appointment-${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many requests.");

    const body = await req.json().catch(() => null);
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(422, "validation_error", "Invalid input.");

    const data = parsed.data;

    if (data.country_code && data.national_number) {
      const check = validatePhone(data.country_code, data.national_number);
      if (!check.valid) throw new ApiError(422, "invalid_phone", "Invalid phone number.");
    }

    const service = createServiceClient();
    const { data: created, error } = await service
      .from("appointments")
      .insert({
        name: data.name,
        phone: data.international_number || data.phone,
        email: data.email || null,
        country: data.country ?? data.country_code ?? null,
        country_code: data.country_code ?? null,
        dial_code: data.dial_code ?? null,
        national_number: data.national_number ?? null,
        international_number: data.international_number ?? null,
        category_id: data.category_id ?? null,
        service_id: data.service_id ?? null,
        doctor_id: data.doctor_id ?? null,
        preferred_date: data.preferred_date ?? null,
        preferred_time: data.preferred_time ?? null,
        message: data.message ?? null,
        consent: data.consent ?? false,
        status: "new",
      })
      .select()
      .single();

    if (error) throw new ApiError(400, "db_error", error.message);

    await service.from("notifications").insert({
      type: "appointment",
      title_ar: "موعد جديد",
      title_en: "New appointment",
      message_ar: `طلب موعد جديد من ${data.name}`,
      message_en: `New appointment request from ${data.name}`,
    });

    return jsonOk({ id: created.id }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
