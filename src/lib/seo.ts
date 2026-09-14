import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { lv } from "@/lib/i18n";
import { getSeoForRoute } from "@/lib/settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eftekar-services.com";

export interface SeoInput {
  lang: Lang;
  route: string; // canonical route WITHOUT lang prefix, e.g. "/services"
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string | null;
  type?: string;
  noIndex?: boolean;
}

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const fallback = await getSeoForRoute(input.route);
  const title =
    input.title ??
    lv(fallback?.title_ar, fallback?.title_en, input.lang) ??
    (input.lang === "ar" ? "عيادات افتخار للخدمات العلاجية" : "Eftekar Medical & Therapeutic Clinics");
  const description =
    input.description ??
    lv(fallback?.description_ar, fallback?.description_en, input.lang) ??
    "";
  const keywords =
    input.keywords ?? lv(fallback?.keywords_ar, fallback?.keywords_en, input.lang) ?? "";

  const canonical = `${SITE_URL}/${input.lang}${input.route === "/" ? "" : input.route}`;
  const alternateLang = input.lang === "ar" ? "en" : "ar";
  const alternateUrl = `${SITE_URL}/${alternateLang}${input.route === "/" ? "" : input.route}`;

  const ogImage = input.ogImage ?? fallback?.og_image ?? `${SITE_URL}/og.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar${input.route === "/" ? "" : input.route}`,
        en: `${SITE_URL}/en${input.route === "/" ? "" : input.route}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Eftekar Medical & Therapeutic Clinics",
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: input.lang === "ar" ? "ar_JO" : "en_US",
      alternateLocale: alternateLang === "ar" ? "ar_JO" : "en_US",
      type: (input.type ?? "website") as "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    other: {
      "og:locale:alternate": input.lang === "ar" ? "en_US" : "ar_JO",
      "og:url": alternateUrl,
    },
  };
}

export function siteUrl(path = "") {
  return `${SITE_URL}${path}`;
}
