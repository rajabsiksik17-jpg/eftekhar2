import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { CONTENT_TAG } from "@/lib/settings";
import { idSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const FORM_COLS = [
  "key", "name_ar", "name_en", "is_active", "submit_button_ar", "submit_button_en",
  "success_message_ar", "success_message_en", "error_message_ar", "error_message_en",
  "notify_email", "notify_enabled",
];

const FIELD_COLS = [
  "field_type", "name", "label_ar", "label_en", "placeholder_ar", "placeholder_en",
  "help_text_ar", "help_text_en", "required", "validation", "default_value", "options",
  "display_order", "is_active",
];

function pick(body: Record<string, unknown>, cols: string[]) {
  const out: Record<string, unknown> = {};
  for (const c of cols) if (c in body) out[c] = body[c];
  return out;
}

async function handle(req: NextRequest, segments: string[]) {
  const service = createServiceClient();

  // List / create forms
  if (segments.length === 0) {
    if (req.method === "GET") {
      await requireAdmin("settings.view");
      const { data } = await service.from("forms").select("*").order("name_ar");
      return jsonOk(data ?? []);
    }
    if (req.method === "POST") {
      const admin = await requireAdmin("settings.update");
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");
      const { data, error } = await service.from("forms").insert(pick(body, FORM_COLS)).select().single();
      if (error) throw new ApiError(400, "db_error", error.message);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "forms.create", entity: "form", entityId: data.id as string });
      return jsonOk(data, { status: 201 });
    }
  }

  // Form-level operations
  if (segments.length === 1) {
    const id = segments[0];
    if (req.method === "GET") {
      await requireAdmin("settings.view");
      const [{ data: form }, { data: fields }] = await Promise.all([
        service.from("forms").select("*").eq("id", id).maybeSingle(),
        service.from("form_fields").select("*").eq("form_id", id).order("display_order"),
      ]);
      return jsonOk({ form, fields: fields ?? [] });
    }
    if (req.method === "PATCH") {
      const admin = await requireAdmin("settings.update");
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");
      await service.from("forms").update(pick(body, FORM_COLS)).eq("id", id);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "forms.update", entity: "form", entityId: id });
      return jsonOk({ ok: true });
    }
    if (req.method === "DELETE") {
      const admin = await requireAdmin("settings.update");
      await service.from("forms").delete().eq("id", id);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "forms.delete", entity: "form", entityId: id });
      return jsonOk({ ok: true });
    }
  }

  // Field operations
  if (segments.length === 2 && segments[1] === "fields") {
    const formId = segments[0];
    if (req.method === "POST") {
      const admin = await requireAdmin("settings.update");
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");
      const { data, error } = await service
        .from("form_fields")
        .insert({ ...pick(body, FIELD_COLS), form_id: formId })
        .select()
        .single();
      if (error) throw new ApiError(400, "db_error", error.message);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "form_field.create", entity: "form", entityId: formId });
      return jsonOk(data, { status: 201 });
    }
  }

  if (segments.length === 2 && segments[1] === "reorder") {
    const formId = segments[0];
    const admin = await requireAdmin("settings.update");
    const body = await req.json().catch(() => null);
    const ids = (body?.ids ?? []) as string[];
    for (let i = 0; i < ids.length; i++) {
      await service.from("form_fields").update({ display_order: i + 1 }).eq("id", ids[i]).eq("form_id", formId);
    }
    revalidateTag(CONTENT_TAG);
    await logAudit({ userId: admin.user.id, action: "form_field.reorder", entity: "form", entityId: formId });
    return jsonOk({ ok: true });
  }

  if (segments.length === 3 && segments[1] === "fields") {
    const formId = segments[0];
    const fieldId = segments[2];
    if (req.method === "PATCH") {
      const admin = await requireAdmin("settings.update");
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");
      await service.from("form_fields").update(pick(body, FIELD_COLS)).eq("id", fieldId).eq("form_id", formId);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "form_field.update", entity: "form", entityId: formId });
      return jsonOk({ ok: true });
    }
    if (req.method === "DELETE") {
      const admin = await requireAdmin("settings.update");
      await service.from("form_fields").delete().eq("id", fieldId).eq("form_id", formId);
      revalidateTag(CONTENT_TAG);
      await logAudit({ userId: admin.user.id, action: "form_field.delete", entity: "form", entityId: formId });
      return jsonOk({ ok: true });
    }
  }

  throw new ApiError(404, "not_found");
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, (await ctx.params).path ?? []);
  } catch (e) {
    return jsonError(e);
  }
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, (await ctx.params).path ?? []);
  } catch (e) {
    return jsonError(e);
  }
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, (await ctx.params).path ?? []);
  } catch (e) {
    return jsonError(e);
  }
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, (await ctx.params).path ?? []);
  } catch (e) {
    return jsonError(e);
  }
}
