import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/encryption";
import { testSmtp, sendMail, sendMailWithAttachments } from "@/lib/email";
import { testImap } from "@/lib/imap";
import { wrapEmail } from "@/lib/mail-template";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin("settings.view");
    const service = createServiceClient();
    const { data } = await service.from("email_settings").select("*").eq("id", 1).maybeSingle();
    const masked = data
      ? {
          ...data,
          smtp_password_enc: data.smtp_password_enc ? "••••••••" : null,
          imap_password_enc: data.imap_password_enc ? "••••••••" : null,
        }
      : null;
    return jsonOk(masked);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("settings.update");
    const service = createServiceClient();
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");

    const patch: Record<string, unknown> = {};
    const fields = [
      "smtp_host", "smtp_port", "smtp_username", "smtp_encryption", "smtp_from",
      "imap_host", "imap_port", "imap_username", "imap_encryption",
      "smtp_enabled", "imap_enabled", "notification_email",
    ];
    for (const f of fields) if (f in body) patch[f] = body[f];
    if (typeof body.smtp_password === "string" && body.smtp_password) patch.smtp_password_enc = encrypt(body.smtp_password);
    if (typeof body.imap_password === "string" && body.imap_password) patch.imap_password_enc = encrypt(body.imap_password);

    // If host/username changed, reset the tested status until re-tested.
    if ("smtp_host" in body || "smtp_username" in body) {
      patch.smtp_status = null;
      patch.smtp_tested_at = null;
    }
    if ("imap_host" in body || "imap_username" in body) {
      patch.imap_status = null;
      patch.imap_tested_at = null;
    }

    await service.from("email_settings").upsert({ id: 1, ...patch }, { onConflict: "id" });
    await logAudit({ userId: admin.user.id, action: "email_settings.update" });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

async function markStatus(table: "smtp" | "imap", ok: boolean, error?: string) {
  const service = createServiceClient();
  await service
    .from("email_settings")
    .update({
      [`${table}_status`]: ok ? "ok" : "failed",
      [`${table}_tested_at`]: new Date().toISOString(),
    })
    .eq("id", 1);
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("settings.update");
    const action = req.nextUrl.searchParams.get("action");
    const body = await req.json().catch(() => ({}));
    const service = createServiceClient();

    if (action === "test-smtp") {
      const password = body.password || decrypt((await service.from("email_settings").select("smtp_password_enc").eq("id", 1).single()).data?.smtp_password_enc);
      const result = await testSmtp({
        host: body.host,
        port: Number(body.port ?? 587),
        username: body.username,
        password,
        encryption: body.encryption ?? "TLS",
        from: body.from ?? body.username,
      });
      await markStatus("smtp", result.ok, result.error);
      await logAudit({ userId: admin.user.id, action: result.ok ? "smtp.test_ok" : "smtp.test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "smtp_failed", result.error));
    }

    if (action === "test-imap") {
      const password = body.password || decrypt((await service.from("email_settings").select("imap_password_enc").eq("id", 1).single()).data?.imap_password_enc);
      const result = await testImap({
        host: body.host,
        port: Number(body.port ?? 993),
        username: body.username,
        password,
        encryption: body.encryption ?? "SSL",
      });
      await markStatus("imap", result.ok, result.error);
      await logAudit({ userId: admin.user.id, action: result.ok ? "imap.test_ok" : "imap.test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "imap_failed", result.error));
    }

    if (action === "send-test") {
      // Prefer the form values (so it works even before saving); fall back to saved config.
      let result: { ok: boolean; error?: string };
      if (body.host && body.username) {
        const { createTransporter } = await import("@/lib/email");
        const transporter = await createTransporter({
          host: body.host,
          port: Number(body.port ?? 587),
          username: body.username,
          password: body.password ?? decrypt((await service.from("email_settings").select("smtp_password_enc").eq("id", 1).single()).data?.smtp_password_enc),
          encryption: body.encryption ?? "TLS",
          from: body.from ?? body.username,
        });
        if (!transporter) {
          result = { ok: false, error: "Invalid configuration." };
        } else {
          try {
            await transporter.sendMail({
              from: body.from ?? body.username,
              to: body.to,
              subject: body.subject ?? "Test email from Eftekar Clinics",
              html: await wrapEmail("رسالة تجريبية", "<p>هذه رسالة تجريبية من لوحة تحكم عيادات افتخار.</p>"),
            });
            result = { ok: true };
          } catch (e) {
            result = { ok: false, error: e instanceof Error ? e.message : "Send failed." };
          }
        }
      } else {
        result = await sendMail({
          to: body.to,
          subject: body.subject ?? "Test email from Eftekar Clinics",
          html: await wrapEmail("رسالة تجريبية", "<p>هذه رسالة تجريبية من لوحة تحكم عيادات افتخار.</p>"),
        });
      }
      await markStatus("smtp", result.ok, result.error);
      await logAudit({ userId: admin.user.id, action: result.ok ? "smtp.send_test_ok" : "smtp.send_test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "smtp_failed", result.error));
    }

    if (action === "send") {
      const to = String(body.to ?? "");
      if (!to) throw new ApiError(400, "missing_to", "Recipient email is required.");
      const attachments = Array.isArray(body.attachments)
        ? body.attachments.map((a: { filename?: string; content?: string; contentType?: string }) => ({
            filename: a.filename ?? "attachment",
            content: Buffer.from(a.content ?? "", "base64"),
            contentType: a.contentType,
          }))
        : undefined;
      const result = await sendMailWithAttachments({
        to,
        subject: body.subject ?? "Eftekar Clinics",
        html: await wrapEmail(body.subject ?? "رسالة", String(body.html ?? "")),
        attachments,
      });
      await markStatus("smtp", result.ok, result.error);
      await logAudit({ userId: admin.user.id, action: result.ok ? "email.send_ok" : "email.send_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "smtp_failed", result.error));
    }

    throw new ApiError(404, "not_found");
  } catch (e) {
    return jsonError(e);
  }
}
