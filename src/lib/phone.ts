export interface Country {
  code: string; // ISO alpha-2
  name: string;
  name_ar: string;
  dial: string; // e.g. "+962"
  flag: string; // emoji
  min: number; // min national number length (without leading 0)
  max: number;
  pattern?: RegExp;
}

export const COUNTRIES: Country[] = [
  { code: "JO", name: "Jordan", name_ar: "الأردن", dial: "+962", flag: "🇯🇴", min: 8, max: 9, pattern: /^7[789]\d{7}$/ },
  { code: "SA", name: "Saudi Arabia", name_ar: "السعودية", dial: "+966", flag: "🇸🇦", min: 9, max: 9, pattern: /^5\d{8}$/ },
  { code: "AE", name: "United Arab Emirates", name_ar: "الإمارات", dial: "+971", flag: "🇦🇪", min: 9, max: 9, pattern: /^5\d{8}$/ },
  { code: "KW", name: "Kuwait", name_ar: "الكويت", dial: "+965", flag: "🇰🇼", min: 8, max: 8 },
  { code: "QA", name: "Qatar", name_ar: "قطر", dial: "+974", flag: "🇶🇦", min: 8, max: 8 },
  { code: "BH", name: "Bahrain", name_ar: "البحرين", dial: "+973", flag: "🇧🇭", min: 8, max: 8 },
  { code: "OM", name: "Oman", name_ar: "عُمان", dial: "+968", flag: "🇴🇲", min: 8, max: 8 },
  { code: "EG", name: "Egypt", name_ar: "مصر", dial: "+20", flag: "🇪🇬", min: 10, max: 10 },
  { code: "IQ", name: "Iraq", name_ar: "العراق", dial: "+964", flag: "🇮🇶", min: 10, max: 10 },
  { code: "LB", name: "Lebanon", name_ar: "لبنان", dial: "+961", flag: "🇱🇧", min: 7, max: 8 },
  { code: "SY", name: "Syria", name_ar: "سوريا", dial: "+963", flag: "🇸🇾", min: 9, max: 9 },
  { code: "PS", name: "Palestine", name_ar: "فلسطين", dial: "+970", flag: "🇵🇸", min: 9, max: 9 },
  { code: "TR", name: "Turkey", name_ar: "تركيا", dial: "+90", flag: "🇹🇷", min: 10, max: 10 },
  { code: "US", name: "United States", name_ar: "الولايات المتحدة", dial: "+1", flag: "🇺🇸", min: 10, max: 10 },
  { code: "CA", name: "Canada", name_ar: "كندا", dial: "+1", flag: "🇨🇦", min: 10, max: 10 },
  { code: "GB", name: "United Kingdom", name_ar: "المملكة المتحدة", dial: "+44", flag: "🇬🇧", min: 10, max: 10 },
  { code: "DE", name: "Germany", name_ar: "ألمانيا", dial: "+49", flag: "🇩🇪", min: 10, max: 11 },
  { code: "FR", name: "France", name_ar: "فرنسا", dial: "+33", flag: "🇫🇷", min: 9, max: 9 },
  { code: "IT", name: "Italy", name_ar: "إيطاليا", dial: "+39", flag: "🇮🇹", min: 9, max: 10 },
  { code: "ES", name: "Spain", name_ar: "إسبانيا", dial: "+34", flag: "🇪🇸", min: 9, max: 9 },
  { code: "IN", name: "India", name_ar: "الهند", dial: "+91", flag: "🇮🇳", min: 10, max: 10 },
  { code: "PK", name: "Pakistan", name_ar: "باكستان", dial: "+92", flag: "🇵🇰", min: 10, max: 10 },
  { code: "RU", name: "Russia", name_ar: "روسيا", dial: "+7", flag: "🇷🇺", min: 10, max: 10 },
  { code: "MY", name: "Malaysia", name_ar: "ماليزيا", dial: "+60", flag: "🇲🇾", min: 9, max: 10 },
  { code: "ID", name: "Indonesia", name_ar: "إندونيسيا", dial: "+62", flag: "🇮🇩", min: 9, max: 12 },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

export function getCountry(code?: string | null): Country {
  if (!code) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

/**
 * Normalize a national number by stripping spaces/dashes and an optional
 * leading zero (local formatting). Returns digits only.
 */
export function normalizeNational(input: string): string {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("0") && digits.length > 1) {
    digits = digits.replace(/^0+/, "");
  }
  return digits;
}

export interface PhoneValidation {
  valid: boolean;
  reason?: string;
}

export function validatePhone(
  countryCode: string,
  nationalNumber: string,
): PhoneValidation {
  const country = getCountry(countryCode);
  const digits = normalizeNational(nationalNumber);
  if (!digits) return { valid: false, reason: "empty" };
  if (!/^\d+$/.test(digits)) return { valid: false, reason: "invalid" };
  if (digits.length < country.min || digits.length > country.max) {
    return { valid: false, reason: "length" };
  }
  if (country.pattern && !country.pattern.test(digits)) {
    return { valid: false, reason: "pattern" };
  }
  return { valid: true };
}

export function buildInternational(dial: string, nationalNumber: string): string {
  const digits = normalizeNational(nationalNumber);
  return `${dial}${digits}`;
}
