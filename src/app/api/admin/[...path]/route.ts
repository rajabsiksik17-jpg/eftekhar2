import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";
import { getEntityConfig } from "@/lib/admin/registry";
import { idSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const entity = path[0];
  const id = path[1];

  const config = getEntityConfig(entity);
  if (!config) throw new ApiError(404, "not_found", "Unknown entity.");

  const method = req.method;
  const verb = method === "POST" ? "create" : method === "PATCH" || method === "PUT" ? "update" : method === "DELETE" ? "delete" : "view";
  const permission = `${config.permission}.${verb}`;

  // Rate limit mutations
  if (verb !== "view") {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`admin-${ip}-${entity}-${verb}`, 60, 60_000);
    if (!rl.ok) throw new ApiError(429, "rate_limited", "Too many requests. Try again shortly.");
  }

  const ctxAuth = await requireAdmin(permission);
  const service = createServiceClient();

  if (method === "GET") {
    if (id) {
      const parsed = idSchema.safeParse({ id });
      if (!parsed.success) throw new ApiError(400, "invalid_id");
      const { data, error } = await service
        .from(config.table)
        .select(config.select ?? "*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new ApiError(500, "db_error", error.message);
      if (!data) throw new ApiError(404, "not_found");
      return jsonOk(data);
    }

    let q = service.from(config.table).select(config.select ?? "*", { count: "exact" });
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "50");

    if (config.baseFilter) {
      for (const [k, v] of Object.entries(config.baseFilter)) q = q.eq(k, v);
    }
    if (search && config.searchableColumns?.length) {
      q = q.or(config.searchableColumns.map((c) => `${c}.ilike.%${search}%`).join(","));
    }
    q = q
      .order(config.order ?? "created_at", { ascending: config.orderAsc ?? true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new ApiError(500, "db_error", error.message);
    return jsonOk({ items: data ?? [], count: count ?? 0, page, pageSize });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");

    // Reorder special action
    if (Array.isArray(body.ids)) {
      const ids = body.ids as string[];
      for (let i = 0; i < ids.length; i++) {
        await service.from(config.table).update({ display_order: i + 1 } as never).eq("id", ids[i]);
      }
      revalidate(config.tags);
      await logAudit({ userId: ctxAuth.user.id, action: "reorder", entity, metadata: { ids } });
      return jsonOk({ ok: true });
    }

    const row = pickColumns(body, config.writeColumns);
    if (config.baseFilter) Object.assign(row, config.baseFilter);
    // Auto-fill display_order when not provided
    if (config.order === "display_order" && (row.display_order === undefined || row.display_order === null || row.display_order === "")) {
      const { data: maxRow } = await service
        .from(config.table)
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      row.display_order = ((maxRow?.display_order as number) ?? 0) + 1;
    }
    const { data, error } = await service.from(config.table).insert(row).select().single();
    if (error) throw new ApiError(400, "db_error", error.message);
    revalidate(config.tags);
    await logAudit({ userId: ctxAuth.user.id, action: `${entity}.create`, entity, entityId: data?.id as string });
    return jsonOk(data, { status: 201 });
  }

  if (method === "PATCH" || method === "PUT") {
    if (!id) throw new ApiError(400, "missing_id");
    const parsed = idSchema.safeParse({ id });
    if (!parsed.success) throw new ApiError(400, "invalid_id");
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new ApiError(400, "invalid_body");
    const row = pickColumns(body, config.writeColumns);
    const { data, error } = await service.from(config.table).update(row).eq("id", id).select().single();
    if (error) throw new ApiError(400, "db_error", error.message);
    revalidate(config.tags);
    await logAudit({ userId: ctxAuth.user.id, action: `${entity}.update`, entity, entityId: id });
    return jsonOk(data);
  }

  if (method === "DELETE") {
    if (!id) throw new ApiError(400, "missing_id");
    const parsed = idSchema.safeParse({ id });
    if (!parsed.success) throw new ApiError(400, "invalid_id");
    const { error } = await service.from(config.table).delete().eq("id", id);
    if (error) throw new ApiError(400, "db_error", error.message);
    revalidate(config.tags);
    await logAudit({ userId: ctxAuth.user.id, action: `${entity}.delete`, entity, entityId: id });
    return jsonOk({ ok: true });
  }

  throw new ApiError(405, "method_not_allowed");
}

function pickColumns(body: Record<string, unknown>, allowed: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) out[key] = body[key];
  }
  return out;
}

function revalidate(tags: string[]) {
  for (const t of tags) revalidateTag(t);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    return jsonError(e);
  }
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    return jsonError(e);
  }
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    return jsonError(e);
  }
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    return jsonError(e);
  }
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    return jsonError(e);
  }
}
