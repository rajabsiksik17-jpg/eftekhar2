"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";
import type { NavigationItem } from "@/lib/types";
import { ChevronDown, Menu, X } from "lucide-react";

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

interface ChildLink {
  key: string;
  label: string;
  url: string;
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
  const [scrolled, setScrolled] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenKey(null);
    setMobileExpanded(null);
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

  const localized = (item: NavigationItem) => (lang === "ar" ? item.label_ar : item.label_en);

  // Build the tree: top-level items with their children (via parent_id).
  const childrenOf = new Map<string, NavigationItem[]>();
  for (const item of nav) {
    if (item.parent_id) {
      const list = childrenOf.get(item.parent_id) ?? [];
      list.push(item);
      childrenOf.set(item.parent_id, list);
    }
  }
  const topLevel = nav.filter((i) => !i.parent_id).sort((a, b) => a.display_order - b.display_order);

  const isServices = (item: NavigationItem) =>
    item.url === "/services" && autoServicesDropdown && categories.length > 0;

  const getChildren = (item: NavigationItem): ChildLink[] | null => {
    if (isServices(item)) {
      return categories.map((c) => ({
        key: `cat-${c.slug}`,
        label: lang === "ar" ? c.name_ar : c.name_en,
        url: `/${lang}/services/${c.slug}`,
      }));
    }
    const kids = childrenOf.get(item.id) ?? [];
    if (kids.length === 0) return null;
    return [
      { key: "self", label: localized(item), url: href(item.url) },
      ...kids.map((k) => ({ key: k.id, label: localized(k), url: href(k.url) })),
    ];
  };

  const openDropdown = (key: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 140);
  };

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
          {topLevel.map((item) => {
            const children = getChildren(item);
            if (!children) {
              return (
                <Link
                  key={item.id}
                  href={href(item.url)}
                  className="rounded-full px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 hover:text-brand-700"
                >
                  {localized(item)}
                </Link>
              );
            }
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => openDropdown(item.id)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={href(item.url)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-50 hover:text-brand-700",
                    openKey === item.id && "bg-brand-50 text-brand-700",
                  )}
                  aria-expanded={openKey === item.id}
                >
                  {localized(item)}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-200", openKey === item.id && "rotate-180")}
                  />
                </Link>
                {/* hover bridge removes the gap so the menu never closes on the way down */}
                <div
                  className={cn(
                    "absolute start-0 top-full pt-2 transition-all duration-200",
                    openKey === item.id ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
                  )}
                >
                  <div className="w-64 overflow-hidden rounded-2xl border border-brand-950/10 bg-white p-2 shadow-soft">
                    {children.map((c) => (
                      <Link
                        key={c.key}
                        href={c.url}
                        className="block rounded-xl px-3 py-2 text-sm text-ink-secondary transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {showLangSwitcher && (
            <Link
              href={switchHref()}
              className="rounded-full px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              aria-label={otherLang === "ar" ? "العربية" : "English"}
            >
              {otherLang === "ar" ? "العربية" : "English"}
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
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-brand-950/10 bg-white lg:hidden">
          <nav className="container-px flex flex-col py-3">
            {topLevel.map((item) => {
              const children = getChildren(item);
              if (!children) {
                return (
                  <Link
                    key={item.id}
                    href={href(item.url)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-brand-900 hover:bg-brand-50"
                  >
                    {localized(item)}
                  </Link>
                );
              }
              const expanded = mobileExpanded === item.id;
              return (
                <div key={item.id} className="border-b border-brand-950/5 last:border-0">
                  <div className="flex items-center">
                    <Link
                      href={href(item.url)}
                      className="flex-1 rounded-xl px-3 py-3 text-sm font-medium text-brand-900 hover:bg-brand-50"
                    >
                      {localized(item)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(expanded ? null : item.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-700 hover:bg-brand-50"
                      aria-expanded={expanded}
                      aria-label={expanded ? "إغلاق" : "فتح"}
                    >
                      <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="pb-2 ps-3">
                      {children.map((c) => (
                        <Link
                          key={c.key}
                          href={c.url}
                          className="block rounded-xl px-3 py-2.5 text-sm text-brand-700 hover:bg-brand-50"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link href={href(ctaUrl)} className="btn-primary btn-md mt-2">
              {ctaText}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
