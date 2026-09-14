import { createServerClientBound } from "@/lib/supabase/client";
import type {
  ContactSettings,
  FooterSettings,
  NavigationItem,
  SeoMetadata,
  SocialLink,
} from "@/lib/types";

export const SETTINGS_TAG = "site-settings";
export const CONTENT_TAG = "site-content";

export interface SiteSettings {
  site_name_ar: string;
  site_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  logo_url: string;
  header: {
    sticky: boolean;
    style: string;
    cta_text_ar: string;
    cta_text_en: string;
    cta_url: string;
    show_phone: boolean;
    show_lang_switcher: boolean;
    auto_services_dropdown: boolean;
  };
  floating: {
    social_enabled: boolean;
    appointment_enabled: boolean;
    back_to_top_enabled: boolean;
    appointment_text_ar: string;
    appointment_text_en: string;
  };
  appointment: {
    enable_consent: boolean;
    consent_text_ar: string;
    consent_text_en: string;
    success_message_ar: string;
    success_message_en: string;
    default_country: string;
  };
}

const defaultHeader = {
  sticky: true,
  style: "solid",
  cta_text_ar: "احجز موعد",
  cta_text_en: "Book Appointment",
  cta_url: "/appointment",
  show_phone: true,
  show_lang_switcher: true,
  auto_services_dropdown: true,
};

const defaultFloating = {
  social_enabled: true,
  appointment_enabled: true,
  back_to_top_enabled: true,
  appointment_text_ar: "احجز موعد",
  appointment_text_en: "Book Appointment",
};

const defaultAppointment = {
  enable_consent: true,
  consent_text_ar: "أوافق على جمع بياناتي لغرض التواصل وتحديد الموعد.",
  consent_text_en:
    "I consent to the collection of my data for contact and scheduling purposes.",
  success_message_ar:
    "تم استلام طلبك بنجاح. سنتواصل معك قريبًا لتأكيد الموعد.",
  success_message_en:
    "Your request has been received. We will contact you shortly to confirm your appointment.",
  default_country: "JO",
};

/**
 * Load site settings directly from Supabase.
 *
 * IMPORTANT:
 * This function uses createServerClientBound(), which internally uses
 * cookies(). Therefore it MUST NOT be wrapped with unstable_cache().
 */
async function loadSettingsRaw(): Promise<Record<string, string | null>> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .limit(100);

  if (error) {
    console.error("Failed to load site settings:", error);
    return {};
  }

  const map: Record<string, string | null> = {};

  for (const row of data ?? []) {
    const value = row.value as
      | { text?: string }
      | Record<string, unknown>
      | null;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      map[row.key] =
        typeof (value as { text?: string }).text === "string"
          ? (value as { text?: string }).text ?? null
          : JSON.stringify(value);
    }
  }

  return map;
}

/**
 * DO NOT use unstable_cache here.
 *
 * createServerClientBound() uses cookies(), and Next.js does not allow
 * dynamic APIs such as cookies() inside unstable_cache().
 */
export async function getSettingsMap(): Promise<
  Record<string, string | null>
> {
  return loadSettingsRaw();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const map = await getSettingsMap();

  return {
    site_name_ar:
      map["site_name_ar"] ?? "عيادات افتخار للخدمات العلاجية",

    site_name_en:
      map["site_name_en"] ?? "Eftekar Medical & Therapeutic Clinics",

    tagline_ar:
      map["tagline_ar"] ?? "استعد لحياة جديدة وثقة أكبر",

    tagline_en:
      map["tagline_en"] ??
      "Get Ready for a New Life and Greater Confidence",

    logo_url: map["logo_url"] ?? "",

    header: {
      ...defaultHeader,
      ...safeJson(map["header"], defaultHeader),
    },

    floating: {
      ...defaultFloating,
      ...safeJson(map["floating"], defaultFloating),
    },

    appointment: {
      ...defaultAppointment,
      ...safeJson(map["appointment"], defaultAppointment),
    },
  };
}

function safeJson<T>(
  value: string | null | undefined,
  fallback: T,
): T {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return {
        ...fallback,
        ...parsed,
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Contact settings
 *
 * No unstable_cache because the Supabase server client uses cookies().
 */
export async function getContactSettings(): Promise<
  ContactSettings | null
> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("contact_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to load contact settings:", error);
    return null;
  }

  return data ?? null;
}

/**
 * Footer settings
 */
export async function getFooterSettings(): Promise<
  FooterSettings | null
> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("footer_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to load footer settings:", error);
    return null;
  }

  return data ?? null;
}

/**
 * Social links
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("Failed to load social links:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Navigation items
 */
export async function getNavigationItems(): Promise<
  NavigationItem[]
> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error("Failed to load navigation items:", error);
    return [];
  }

  return data ?? [];
}

/**
 * SEO metadata
 *
 * route is still passed as an argument, but the function itself
 * cannot be placed inside unstable_cache because the Supabase
 * server client accesses cookies().
 */
export async function getSeoForRoute(
  route: string,
): Promise<SeoMetadata | null> {
  const supabase = await createServerClientBound();

  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("route", route)
    .maybeSingle();

  if (error) {
    console.error(
      `Failed to load SEO metadata for route "${route}":`,
      error,
    );
    return null;
  }

  return data ?? null;
}