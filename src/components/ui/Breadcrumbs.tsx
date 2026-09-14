import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, lang }: { items: Crumb[]; lang: Lang }) {
  const Sep = lang === "ar" ? ChevronLeft : ChevronRight;
  const data = [
    { label: lang === "ar" ? "الرئيسية" : "Home", href: `/${lang}` },
    ...items,
  ];

  const structured = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: data.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${process.env.NEXT_PUBLIC_SITE_URL || ""}${c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-brand-100/70">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5">
        {data.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <Sep className="h-3.5 w-3.5 opacity-60" />}
            {c.href && i < data.length - 1 ? (
              <Link href={c.href} className="hover:text-white">
                {c.label}
              </Link>
            ) : (
              <span className={i === data.length - 1 ? "text-white" : ""}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
