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
    const [{ data: roles }, { data: permissions }, { data: rolePerms }] = await Promise.all([
      service.from("roles").select("*").order("name"),
      service.from("permissions").select("*").order("group").order("name"),
      service.from("role_permissions").select("*"),
    ]);
    return jsonOk({ roles, permissions, role_permissions: rolePerms });
  } catch (e) {
    return jsonError(e);
  }
}

const updateSchema = z.object({
  role_id: z.string().uuid(),
  permission_ids: z.array(z.string().uuid()),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("users.update");
    const service = createServiceClient();
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(422, "validation_error", "Invalid input.");

    const { role_id, permission_ids } = parsed.data;
    await service.from("role_permissions").delete().eq("role_id", role_id);
    if (permission_ids.length) {
      await service
        .from("role_permissions")
        .insert(permission_ids.map((permission_id) => ({ role_id, permission_id })));
    }
    await logAudit({ userId: admin.user.id, action: "role_permissions.update", entity: "role", entityId: role_id });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
