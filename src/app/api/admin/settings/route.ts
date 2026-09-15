import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { SETTINGS_TAG } from "@/lib/settings";

export const dynamic = "force-dynamic";

const SITE_KEYS = [
  "site_name_ar",
  "site_name_en",
  "tagline_ar",
  "tagline_en",
  "logo_url",
  "favicon",
  "header",
  "floating",
  "appointment",
  "appearance",
  "analytics",
];

export async function GET() {
  try {
    await requireAdmin("settings.view");
    const service = createServiceClient();
    const [{ data: settings }, { data: contact }, { data: footer }] = await Promise.all([
      service.from("site_settings").select("key, value"),
      service.from("contact_settings").select("*").eq("id", 1).single(),
      service.from("footer_settings").select("*").eq("id", 1).single(),
    ]);

    const map: Record<string, unknown> = {};
    for (const row of settings ?? []) {
      const v = row.value as { text?: string };
      if (SITE_KEYS.includes(row.key)) {
        map[row.key] =
          v && typeof v === "object" && !Array.isArray(v) && typeof v.text === "string" ? v.text : v;
      }
    }

    return jsonOk({ site: map, contact, footer });
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

    if (body.site && typeof body.site === "object") {
      for (const key of SITE_KEYS) {
        if (!(key in body.site)) continue;
        const value = body.site[key];
        const payload =
          typeof value === "object" && value !== null ? value : { text: String(value ?? "") };
        await service.from("site_settings").upsert({ key, value: payload }, { onConflict: "key" });
      }
    }

    if (body.contact && typeof body.contact === "object") {
      const allowed = ["phone", "whatsapp", "email", "address_ar", "address_en", "google_maps_url", "working_hours", "emergency_phone", "secondary_phone"];
      const patch: Record<string, unknown> = {};
      for (const k of allowed) if (k in body.contact) patch[k] = body.contact[k];
      if (Object.keys(patch).length) await service.from("contact_settings").update(patch).eq("id", 1);
    }

    if (body.footer && typeof body.footer === "object") {
      const allowed = ["about_ar", "about_en", "copyright_ar", "copyright_en", "columns"];
      const patch: Record<string, unknown> = {};
      for (const k of allowed) if (k in body.footer) patch[k] = body.footer[k];
      if (Object.keys(patch).length) await service.from("footer_settings").update(patch).eq("id", 1);
    }

    revalidateTag(SETTINGS_TAG);
    await logAudit({ userId: admin.user.id, action: "settings.update", entity: "settings" });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
