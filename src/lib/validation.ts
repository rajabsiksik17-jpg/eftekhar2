import { z } from "zod";

const email = z.string().email("invalid_email").optional().or(z.literal(""));

export const appointmentSchema = z.object({
  name: z.string().min(2, "name_required").max(120),
  phone: z.string().min(6, "phone_required").max(30),
  email: email,
  country: z.string().max(2).optional(),
  country_code: z.string().max(2).optional(),
  dial_code: z.string().max(6).optional(),
  national_number: z.string().max(20).optional(),
  international_number: z.string().max(30).optional(),
  category_id: z.string().uuid().optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  doctor_id: z.string().uuid().optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().max(50).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
  consent: z.boolean().optional().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(2, "name_required").max(120),
  phone: z.string().min(6, "phone_required").max(30).optional().or(z.literal("")),
  email: email,
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(5, "message_required").max(5000),
});

export const loginSchema = z.object({
  email: z.string().email("invalid_email"),
  password: z.string().min(6, "password_too_short").max(200),
});

export const otpVerifySchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "invalid_otp"),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export function optionalUrl(v: unknown) {
  const parsed = z.string().url().optional().or(z.literal("")).safeParse(v);
  return parsed.success ? parsed.data || null : null;
}
