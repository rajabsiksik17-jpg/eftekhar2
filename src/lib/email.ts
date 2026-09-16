import nodemailer, { type Transporter } from "nodemailer";
import { createServiceClient } from "@/lib/supabase/client";
import { decrypt } from "@/lib/encryption";

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "NONE" | "TLS" | "SSL";
  from: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("email_settings").select("*").eq("id", 1).single();
  if (!data?.smtp_host || !data?.smtp_username) return null;
  return {
    host: data.smtp_host,
    port: data.smtp_port ?? 587,
    username: data.smtp_username,
    password: decrypt(data.smtp_password_enc),
    encryption: (data.smtp_encryption as SmtpConfig["encryption"]) ?? "TLS",
    from: data.smtp_from ?? data.smtp_username,
  };
}

export async function createTransporter(config?: SmtpConfig | null): Promise<Transporter | null> {
  const c = config ?? (await getSmtpConfig());
  if (!c) return null;
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.encryption === "SSL",
    requireTLS: c.encryption === "TLS",
    auth: { user: c.username, pass: c.password },
  });
}

export async function sendMail(
  opts: { to: string; subject: string; html: string; text?: string },
): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP is not configured." };
  const transporter = await createTransporter(config);
  if (!transporter) return { ok: false, error: "Could not create transporter." };
  try {
    await transporter.sendMail({
      from: config.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed." };
  }
}

export async function sendMailWithAttachments(
  opts: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: { filename: string; content: Buffer; contentType?: string }[];
  },
): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP is not configured." };
  const transporter = await createTransporter(config);
  if (!transporter) return { ok: false, error: "Could not create transporter." };
  try {
    await transporter.sendMail({
      from: config.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed." };
  }
}

export async function testSmtp(config: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const transporter = await createTransporter(config);
    if (!transporter) return { ok: false, error: "Invalid configuration." };
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed." };
  }
}
