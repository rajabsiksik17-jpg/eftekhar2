import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const service = createServiceClient();
    const { data } = await service
      .from("notifications")
      .select("type")
      .eq("is_read", false);

    const counts: Record<string, number> = { appointment: 0, contact: 0, total: 0 };
    for (const n of data ?? []) {
      counts.total++;
      if (n.type === "appointment") counts.appointment++;
      else if (n.type === "contact") counts.contact++;
    }
    return jsonOk(counts);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const service = createServiceClient();
    const body = await req.json().catch(() => ({}));
    const type = (body.type as string) || null;
    let q = service.from("notifications").update({ is_read: true }).eq("is_read", false);
    if (type) q = q.eq("type", type);
    await q;
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
