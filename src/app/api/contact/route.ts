import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";
import { contactSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`contact-${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many requests.");

    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(422, "validation_error", "Invalid input.");

    const data = parsed.data;
    const service = createServiceClient();

    const { data: created, error } = await service
      .from("contact_messages")
      .insert({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        subject: data.subject || null,
        message: data.message,
      })
      .select()
      .single();

    if (error) throw new ApiError(400, "db_error", error.message);

    await service.from("notifications").insert({
      type: "contact",
      title_ar: "رسالة جديدة",
      title_en: "New message",
      message_ar: `رسالة جديدة من ${data.name}`,
      message_en: `New message from ${data.name}`,
    });

    return jsonOk({ id: created.id }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
