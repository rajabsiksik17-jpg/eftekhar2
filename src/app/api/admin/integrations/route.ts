import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { encrypt } from "@/lib/encryption";
import { SETTINGS_TAG } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin("settings.view");
    const service = createServiceClient();
    const [{ data: ga4 }, { data: gsc }] = await Promise.all([
      service.from("analytics_integrations").select("*").order("created_at").limit(5),
      service.from("search_console_integrations").select("*").order("created_at").limit(5),
    ]);
    return jsonOk({
      ga4: ga4?.[0] ?? null,
      searchConsole: gsc?.[0]
        ? { ...gsc[0], private_key_enc: gsc[0].private_key_enc ? "••••••••" : null }
        : null,
    });
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

    if (body.ga4) {
      await service.from("analytics_integrations").upsert(
        {
          id: body.ga4.id ?? undefined,
          type: "ga4",
          enabled: Boolean(body.ga4.enabled),
          measurement_id: body.ga4.measurement_id ?? null,
        },
        { onConflict: "id" },
      );
      // Mirror to public site_settings so the frontend injects the GA script.
      await service
        .from("site_settings")
        .upsert(
          { key: "analytics", value: { ga4_enabled: Boolean(body.ga4.enabled), ga4_id: body.ga4.measurement_id ?? "" } },
          { onConflict: "key" },
        );
    }

    if (body.searchConsole) {
      const patch: Record<string, unknown> = {
        enabled: Boolean(body.searchConsole.enabled),
        site_url: body.searchConsole.site_url ?? null,
        client_email: body.searchConsole.client_email ?? null,
      };
      if (body.searchConsole.id) patch.id = body.searchConsole.id;
      if (typeof body.searchConsole.private_key === "string" && body.searchConsole.private_key) {
        patch.private_key_enc = encrypt(body.searchConsole.private_key);
      }
      await service.from("search_console_integrations").upsert(patch, { onConflict: "id" });
    }

    await logAudit({ userId: admin.user.id, action: "integrations.update" });
    revalidateTag(SETTINGS_TAG);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
