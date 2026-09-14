import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { encrypt } from "@/lib/encryption";
import { testSmtp } from "@/lib/email";
import { testImap } from "@/lib/imap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin("settings.view");
    const service = createServiceClient();
    const { data } = await service.from("email_settings").select("*").eq("id", 1).single();
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
    const fields = ["smtp_host", "smtp_port", "smtp_username", "smtp_encryption", "smtp_from", "imap_host", "imap_port", "imap_username", "imap_encryption"];
    for (const f of fields) if (f in body) patch[f] = body[f];
    if (typeof body.smtp_password === "string" && body.smtp_password) patch.smtp_password_enc = encrypt(body.smtp_password);
    if (typeof body.imap_password === "string" && body.imap_password) patch.imap_password_enc = encrypt(body.imap_password);

    await service.from("email_settings").upsert({ id: 1, ...patch }, { onConflict: "id" });
    await logAudit({ userId: admin.user.id, action: "email_settings.update" });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("settings.update");
    const action = req.nextUrl.searchParams.get("action");
    const body = await req.json().catch(() => ({}));

    if (action === "test-smtp") {
      const result = await testSmtp({
        host: body.host,
        port: Number(body.port ?? 587),
        username: body.username,
        password: body.password,
        encryption: body.encryption ?? "TLS",
        from: body.from ?? body.username,
      });
      await logAudit({ userId: admin.user.id, action: result.ok ? "smtp.test_ok" : "smtp.test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "smtp_failed", result.error));
    }

    if (action === "test-imap") {
      const result = await testImap({
        host: body.host,
        port: Number(body.port ?? 993),
        username: body.username,
        password: body.password,
        encryption: body.encryption ?? "SSL",
      });
      await logAudit({ userId: admin.user.id, action: result.ok ? "imap.test_ok" : "imap.test_failed" });
      return result.ok ? jsonOk({ ok: true }) : jsonError(new ApiError(400, "imap_failed", result.error));
    }

    throw new ApiError(404, "not_found");
  } catch (e) {
    return jsonError(e);
  }
}
