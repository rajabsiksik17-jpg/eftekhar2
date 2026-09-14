import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin, logAudit } from "@/lib/auth";
import { jsonOk, jsonError, ApiError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "video/mp4", "video/webm", "application/pdf"];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("media.upload");
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`upload-${ip}`, 30, 60_000);
    if (!rl.ok) throw new ApiError(429, "rate_limited");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "no_file", "No file provided.");
    if (file.size > MAX_SIZE) throw new ApiError(413, "too_large", "File exceeds 15MB limit.");
    if (!ALLOWED.includes(file.type)) throw new ApiError(415, "invalid_type", "File type not allowed.");

    const service = createServiceClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { data: upload, error } = await service.storage
      .from("media")
      .upload(key, file, { contentType: file.type, upsert: false });
    if (error) throw new ApiError(400, "upload_failed", error.message);

    const { data: publicUrl } = service.storage.from("media").getPublicUrl(key);

    let width: number | null = null;
    let height: number | null = null;
    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sharp = (await import("sharp")).default;
        const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch {
        /* noop */
      }
    }

    const { data: row } = await service
      .from("media_files")
      .insert({
        filename: file.name,
        bucket: "media",
        path: key,
        url: publicUrl.publicUrl,
        alt_text: String(form.get("alt_text") ?? ""),
        mime_type: file.type,
        size_bytes: file.size,
        width,
        height,
        created_by: admin.user.id,
      })
      .select()
      .single();

    await logAudit({ userId: admin.user.id, action: "media.upload", entity: "media", entityId: row?.id as string, metadata: { filename: file.name } });
    return jsonOk(row, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
