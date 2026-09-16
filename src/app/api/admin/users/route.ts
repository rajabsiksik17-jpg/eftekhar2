import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin("users.view");
    const service = createServiceClient();
    const { data: profiles, error } = await service
      .from("profiles")
      .select("*, user_roles(role_id)")
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);
    return jsonOk(profiles);
  } catch (e) {
    return jsonError(e);
  }
}

const createSchema = z.object({
  email: z.string().email("Invalid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  full_name: z.string().optional(),
  role_ids: z.array(z.string().uuid()).optional().default([]),
  is_super_admin: z.boolean().optional().default(false),
});

const updateSchema = z.object({
  full_name: z.string().optional(),
  is_active: z.boolean().optional(),
  is_super_admin: z.boolean().optional(),
  role_ids: z.array(z.string().uuid()).optional(),
  notify_email: z.string().optional(),
  notify_events: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.create");
    const service = createServiceClient();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ApiError(422, "validation_error", msg || "Invalid input.");
    }

    const d = parsed.data;
    const { data: authUser, error } = await service.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { full_name: d.full_name },
    });
    if (error) throw new ApiError(400, "create_failed", error.message);

    await service.from("profiles").insert({
      id: authUser.user!.id,
      email: d.email,
      full_name: d.full_name || null,
      is_super_admin: d.is_super_admin,
      is_active: true,
    });
    if (d.role_ids.length) {
      await service
        .from("user_roles")
        .insert(d.role_ids.map((role_id) => ({ user_id: authUser.user!.id, role_id })));
    }
    await logAudit({ userId: admin.user.id, action: "users.create", entity: "user", entityId: authUser.user!.id });
    return jsonOk({ id: authUser.user!.id }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.update");
    const service = createServiceClient();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ApiError(422, "validation_error", msg || "Invalid input.");
    }

    const id = (body as { id?: string }).id;
    if (!id) throw new ApiError(400, "missing_id");
    const d = parsed.data;

    const profilePatch: Record<string, unknown> = {};
    if (d.full_name !== undefined) profilePatch.full_name = d.full_name || null;
    if (d.is_active !== undefined) profilePatch.is_active = d.is_active;
    if (d.is_super_admin !== undefined) profilePatch.is_super_admin = d.is_super_admin;
    if (d.notify_email !== undefined) profilePatch.notify_email = d.notify_email || null;
    if (d.notify_events !== undefined) profilePatch.notify_events = d.notify_events;
    if (Object.keys(profilePatch).length) {
      await service.from("profiles").update(profilePatch).eq("id", id);
    }
    if (d.role_ids !== undefined) {
      await service.from("user_roles").delete().eq("user_id", id);
      if (d.role_ids.length) {
        await service.from("user_roles").insert(d.role_ids.map((role_id) => ({ user_id: id, role_id })));
      }
    }
    await logAudit({ userId: admin.user.id, action: "users.update", entity: "user", entityId: id });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
