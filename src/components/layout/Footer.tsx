import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type {
  ContactSettings,
  FooterSettings,
  NavigationItem,
  Service,
  ServiceCategory,
  SocialLink,
} from "@/lib/types";
import { socialIcon } from "@/components/icons";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

interface FooterProps {
  lang: Lang;
  siteName: string;
  logoUrl: string | null;
  nav: NavigationItem[];
  contact: ContactSettings | null;
  footer: FooterSettings | null;
  social: SocialLink[];
  categories: ServiceCategory[];
  services: Service[];
  ctaText: string;
  ctaUrl: string;
}

export function Footer(props: FooterProps) {
  const { lang, siteName, logoUrl, nav, contact, footer, social, categories, services, ctaText, ctaUrl } =
    props;

  const href = (url: string) => {
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  const t = (ar?: string | null, en?: string | null) => (lang === "ar" ? ar : en) ?? "";
  const year = new Date().getFullYear();
  const workingHours = (Array.isArray(contact?.working_hours) ? contact.working_hours : []) as Record<string, string>[];

  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="container-px grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-11 w-auto object-contain" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-white">
                {lang === "ar" ? "اف" : "E"}
              </span>
            )}
            <span className="text-sm font-bold text-white">{siteName}</span>
          </div>
          <p className="text-sm leading-relaxed text-brand-100/70">
            {t(footer?.about_ar, footer?.about_en)}
          </p>
          <div className="flex flex-wrap gap-2">
            {social
              .filter((s) => s.url)
              .map((s) => {
                const Icon = socialIcon(s.platform);
                return (
                  <a
                    key={s.id}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition hover:bg-brand-600"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">
            {lang === "ar" ? "روابط سريعة" : "Quick Links"}
          </h3>
          <ul className="space-y-2.5">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={href(item.url)}
                  className="text-sm text-brand-100/70 transition hover:text-white"
                >
                  {lang === "ar" ? item.label_ar : item.label_en}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href("/appointment")} className="text-sm text-brand-100/70 hover:text-white">
                {ctaText}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">
            {lang === "ar" ? "تخصصاتنا" : "Our Specialties"}
          </h3>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/${lang}/services/${c.slug}`}
                  className="text-sm text-brand-100/70 transition hover:text-white"
                >
                  {lang === "ar" ? c.name_ar : c.name_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="mb-4 text-sm font-bold text-white">
            {lang === "ar" ? "تواصل معنا" : "Contact Us"}
          </h3>
          {contact?.phone && (
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 text-sm text-brand-100/70" dir="ltr">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              {contact.phone}
            </a>
          )}
          {contact?.email && (
            <a href={`mailto:${contact.email}`} className="flex items-start gap-3 text-sm text-brand-100/70">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              {contact.email}
            </a>
          )}
          {t(contact?.address_ar, contact?.address_en) && (
            <p className="flex items-start gap-3 text-sm text-brand-100/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              {t(contact?.address_ar, contact?.address_en)}
            </p>
          )}
          {workingHours.length > 0 && (
            <div className="flex items-start gap-3 text-sm text-brand-100/70">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <div className="space-y-1">
                {workingHours.map((w: Record<string, string>, i: number) => (
                  <div key={i}>
                    <div>{lang === "ar" ? w.days_ar : w.days_en}</div>
                    <div className="text-brand-100/50">{lang === "ar" ? w.hours_ar : w.hours_en}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-brand-100/50 sm:flex-row sm:text-start">
          <p>
            {(footer?.copyright_ar ?? "").replace("{year}", String(year)) ||
              `${siteName} © ${year}`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${lang}/privacy-policy`} className="hover:text-white">
              {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <Link href={`/${lang}/terms`} className="hover:text-white">
              {lang === "ar" ? "الشروط والأحكام" : "Terms"}
            </Link>
            <Link href={`/${lang}/medical-disclaimer`} className="hover:text-white">
              {lang === "ar" ? "إخلاء المسؤولية الطبية" : "Medical Disclaimer"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
