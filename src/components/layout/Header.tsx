"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";
import type { NavigationItem } from "@/lib/types";
import { ChevronDown, Menu, Phone, Search, X, Globe } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";

interface HeaderProps {
  lang: Lang;
  siteName: string;
  logoUrl: string | null;
  nav: NavigationItem[];
  ctaText: string;
  ctaUrl: string;
  showPhone: boolean;
  phone: string | null;
  showLangSwitcher: boolean;
  autoServicesDropdown: boolean;
  categories: { slug: string; name_ar: string; name_en: string }[];
}

export function Header(props: HeaderProps) {
  const {
    lang,
    siteName,
    logoUrl,
    nav,
    ctaText,
    ctaUrl,
    showPhone,
    phone,
    showLangSwitcher,
    autoServicesDropdown,
    categories,
  } = props;

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  const href = (url: string) => {
    if (url.startsWith("http")) return url;
    const path = url === "/" ? "" : url;
    return `/${lang}${path || ""}`;
  };

  const otherLang = lang === "ar" ? "en" : "ar";
  const switchHref = () => {
    const path = pathname.replace(/^\/(ar|en)/, "");
    return `/${otherLang}${path || ""}`;
  };

  const isServices = (item: NavigationItem) =>
    item.url === "/services" && autoServicesDropdown && categories.length > 0;

  const localized = (item: NavigationItem) => (lang === "ar" ? item.label_ar : item.label_en);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-brand-950/10 bg-white/95 shadow-sm backdrop-blur"
          : "bg-white/90 backdrop-blur",
      )}
    >
      <div className="container-px flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2.5" aria-label={siteName}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-11 w-auto object-contain" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
              {lang === "ar" ? "اف" : "E"}
            </span>
          )}
          <span className="hidden flex-col sm:flex">
            <span className="text-sm font-bold leading-tight text-brand-950">{siteName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((item) =>
            isServices(item) ? (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href={href(item.url)}
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 hover:text-brand-700"
                >
                  {localized(item)}
                  <ChevronDown className="h-4 w-4" />
                </Link>
                {servicesOpen && (
                  <div className="absolute top-full mt-1 w-64 rounded-2xl border border-brand-950/10 bg-white p-2 shadow-soft">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${lang}/services/${c.slug}`}
                        className="block rounded-xl px-3 py-2 text-sm text-brand-800 hover:bg-brand-50"
                      >
                        {lang === "ar" ? c.name_ar : c.name_en}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={href(item.url)}
                className="rounded-full px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 hover:text-brand-700"
              >
                {localized(item)}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {showPhone && phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 xl:flex"
              dir="ltr"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50"
          >
            <Search className="h-5 w-5" />
          </button>

          {showLangSwitcher && (
            <Link
              href={switchHref()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-brand-700 hover:bg-brand-50"
              aria-label={otherLang === "ar" ? "العربية" : "English"}
            >
              <Globe className="h-5 w-5" />
            </Link>
          )}

          <Link href={href(ctaUrl)} className="btn-primary btn-sm hidden animate-pulse-soft sm:inline-flex">
            {ctaText}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-50 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-950/10 bg-white lg:hidden">
          <nav className="container-px flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={href(item.url)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
              >
                {localized(item)}
              </Link>
            ))}
            {showPhone && phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-700"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            )}
            <Link href={href(ctaUrl)} className="btn-primary btn-md mt-2">
              {ctaText}
            </Link>
          </nav>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} lang={lang} />
    </header>
  );
}
