export type Lang = "ar" | "en";

export const LANGS: Lang[] = ["ar", "en"];
export const DEFAULT_LANG: Lang = "ar";

export function isLang(value: string | null | undefined): value is Lang {
  return value === "ar" || value === "en";
}

/** Pick the localized value of a *_ar / *_en field pair. */
export function lv(ar: string | null | undefined, en: string | null | undefined, lang: Lang): string {
  const value = lang === "ar" ? ar : en;
  return (value ?? (ar ?? en ?? "")).trim();
}

/** Resolve a localized JSON object of shape { ar, en }. */
export function pickLocalized<T>(obj: { ar?: T; en?: T } | null | undefined, lang: Lang): T | undefined {
  if (!obj) return undefined;
  return lang === "ar" ? obj.ar : obj.en;
}

export const dir = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

export interface LocalizedText {
  ar?: string | null;
  en?: string | null;
}
