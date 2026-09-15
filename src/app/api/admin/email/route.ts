import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/encryption";
import { testSmtp, sendMail } from "@/lib/email";
import { testImap } from "@/lib/imap";

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
      "smtp_enabled", "imap_enabled",
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
      const result = await sendMail({
        to: body.to,
        subject: body.subject ?? "Test email from Eftekar Clinics",
        html: "<p>This is a test email from your Eftekar Clinics admin dashboard.</p>",
        text: "This is a test email from your Eftekar Clinics admin dashboard.",
      });
      await markStatus("smtp", result.ok, result.error);
      await logAudit({ userId: admin.user.id, action: result.ok ? "smtp.send_test_ok" : "smtp.send_test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "smtp_failed", result.error));
    }

    throw new ApiError(404, "not_found");
  } catch (e) {
    return jsonError(e);
  }
}
