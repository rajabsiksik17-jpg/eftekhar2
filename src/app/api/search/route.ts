import { NextRequest } from "next/server";
import { createServerClientBound } from "@/lib/supabase/client";
import { jsonOk, jsonError, rateLimit } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const lang = (req.nextUrl.searchParams.get("lang") ?? "ar") as Lang;

    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rl = rateLimit(`search-${ip}`, 60, 60_000);
    if (!rl.ok) throw new Error("rate_limited");

    if (q.length < 2) return jsonOk([]);

    const supabase = await createServerClientBound();
    const ilike = `%${q}%`;
    const nameCol = lang === "ar" ? "name_ar" : "name_en";

    const [services, categories, doctors, videos] = await Promise.all([
      supabase.from("services").select("id, slug, name_ar, name_en, description_ar, description_en, category_id").or(`${nameCol}.ilike.${ilike}`).eq("is_active", true).limit(6),
      supabase.from("service_categories").select("id, slug, name_ar, name_en").or(`${nameCol}.ilike.${ilike}`).eq("is_active", true).limit(6),
      supabase.from("doctors").select("id, slug, name_ar, name_en, specialty_ar, specialty_en").or(`${nameCol}.ilike.${ilike}`).eq("is_active", true).limit(6),
      supabase.from("videos").select("id, title_ar, title_en").or(`${lang === "ar" ? "title_ar" : "title_en"}.ilike.${ilike}`).eq("is_active", true).limit(6),
    ]);

    const catMap = new Map((categories.data ?? []).map((c) => [c.id, c.slug]));
    const results: unknown[] = [];

    for (const s of services.data ?? []) {
      results.push({
        id: s.id,
        title: lang === "ar" ? s.name_ar : s.name_en,
        subtitle: lang === "ar" ? s.description_ar : s.description_en,
        href: `/${lang}/services/${catMap.get(s.category_id) ?? ""}/${s.slug}`,
        type: "service",
        typeLabel: lang === "ar" ? "خدمة" : "Service",
      });
    }
    for (const c of categories.data ?? []) {
      results.push({
        id: c.id,
        title: lang === "ar" ? c.name_ar : c.name_en,
        href: `/${lang}/services/${c.slug}`,
        type: "category",
        typeLabel: lang === "ar" ? "تصنيف" : "Category",
      });
    }
    for (const d of doctors.data ?? []) {
      results.push({
        id: d.id,
        title: lang === "ar" ? d.name_ar : d.name_en,
        subtitle: lang === "ar" ? d.specialty_ar : d.specialty_en,
        href: `/${lang}/doctors`,
        type: "doctor",
        typeLabel: lang === "ar" ? "طبيب" : "Doctor",
      });
    }
    for (const v of videos.data ?? []) {
      results.push({
        id: v.id,
        title: lang === "ar" ? v.title_ar : v.title_en,
        href: `/${lang}/videos`,
        type: "video",
        typeLabel: lang === "ar" ? "فيديو" : "Video",
      });
    }

    return jsonOk(results);
  } catch (e) {
    return jsonError(e);
  }
}
