import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/client";
import { SETTINGS_TAG } from "@/lib/settings";

export interface Appearance {
  primary: string;
  secondary: string;
  accent: string;
  logo: string;
  favicon: string;
  ga4_enabled: boolean;
  ga4_id: string;
}

export const DEFAULT_APPEARANCE: Appearance = {
  primary: "#2563eb",
  secondary: "#0ea5e9",
  accent: "#0d9488",
  logo: "",
  favicon: "",
  ga4_enabled: false,
  ga4_id: "",
};

export const getAppearance = unstable_cache(
  async (): Promise<Appearance> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["appearance", "analytics", "logo_url", "favicon"])
      .limit(10);

    const map: Record<string, Record<string, unknown>> = {};
    for (const row of data ?? []) {
      const v = row.value as Record<string, unknown> | { text?: string } | null;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        map[row.key] = v as Record<string, unknown>;
      }
    }

    const appearance = (map["appearance"] ?? {}) as Record<string, unknown>;
    const analytics = (map["analytics"] ?? {}) as Record<string, unknown>;
    const logo = (map["logo_url"] as { text?: string } | undefined)?.text ?? "";

    return {
      primary: (appearance.primary as string) || DEFAULT_APPEARANCE.primary,
      secondary: (appearance.secondary as string) || DEFAULT_APPEARANCE.secondary,
      accent: (appearance.accent as string) || DEFAULT_APPEARANCE.accent,
      logo: logo || (appearance.logo as string) || "",
      favicon: (appearance.favicon as string) || "",
      ga4_enabled: Boolean(analytics.ga4_enabled),
      ga4_id: (analytics.ga4_id as string) || "",
    };
  },
  ["appearance"],
  { revalidate: 300, tags: [SETTINGS_TAG] },
);
