import type { MetadataRoute } from "next";
import { createAnonClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eftekar-services.com";

const STATIC_PATHS = [
  "",
  "/about",
  "/doctors",
  "/services",
  "/videos",
  "/gallery",
  "/contact",
  "/appointment",
  "/privacy-policy",
  "/terms",
  "/medical-disclaimer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAnonClient();
  const urls: MetadataRoute.Sitemap = [];

  for (const lang of ["ar", "en"]) {
    for (const p of STATIC_PATHS) {
      urls.push({
        url: `${SITE_URL}/${lang}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : p === "/services" ? 0.9 : 0.7,
        alternates: { languages: { ar: `${SITE_URL}/ar${p}`, en: `${SITE_URL}/en${p}` } },
      });
    }
  }

  const [cats, services] = await Promise.all([
    supabase.from("service_categories").select("id, slug").eq("is_active", true),
    supabase.from("services").select("slug, category_id").eq("is_active", true),
  ]);

  const catSlugById = new Map<string, string>();
  for (const c of cats.data ?? []) {
    catSlugById.set(c.id, c.slug);
  }

  for (const lang of ["ar", "en"]) {
    for (const c of cats.data ?? []) {
      urls.push({
        url: `${SITE_URL}/${lang}/services/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const s of services.data ?? []) {
      const cat = catSlugById.get(s.category_id);
      if (!cat) continue;
      urls.push({
        url: `${SITE_URL}/${lang}/services/${cat}/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return urls;
}
