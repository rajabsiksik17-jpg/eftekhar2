import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { Service, ServiceCategory } from "@/lib/types";
import { Icon } from "@/components/icons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServiceCard({
  service,
  category,
  lang,
  className,
}: {
  service: Service;
  category?: ServiceCategory;
  lang: Lang;
  className?: string;
}) {
  const name = lang === "ar" ? service.name_ar : service.name_en;
  const desc = lang === "ar" ? service.description_ar : service.description_en;
  const href = category
    ? `/${lang}/services/${category.slug}/${service.slug}`
    : `/${lang}/services`;

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={href}
      className={cn(
        "card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft",
        className,
      )}
    >
      {service.is_featured && (
        <span className="absolute top-4 end-4 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700">
          {lang === "ar" ? "مميز" : "Featured"}
        </span>
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={service.icon} className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-brand-950">{name}</h3>
      {desc && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-700/80">{desc}</p>}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        {lang === "ar" ? "اقرأ المزيد" : "Learn more"}
        <Arrow className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}
