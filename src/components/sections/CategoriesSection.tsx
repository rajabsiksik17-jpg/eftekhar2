import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection, ServiceCategory } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/icons";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function CategoriesSection({
  section,
  categories,
  lang,
}: {
  section: PageSection;
  categories: ServiceCategory[];
  lang: Lang;
}) {
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${lang}/services/${c.slug}`}
              className="card group relative flex flex-col items-center gap-4 overflow-hidden p-6 text-center transition hover:-translate-y-1 hover:shadow-soft"
            >
              {c.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.cover_image}
                  alt={lang === "ar" ? c.name_ar : c.name_en}
                  className="absolute inset-0 h-full w-full object-cover opacity-10 transition group-hover:opacity-20"
                />
              )}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white transition-transform group-hover:scale-110">
                <Icon name={c.icon} className="h-8 w-8" />
              </div>
              <div className="relative">
                <h3 className="font-bold text-brand-950">{lang === "ar" ? c.name_ar : c.name_en}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                  {lang === "ar" ? "التفاصيل" : "Details"}
                  <Arrow className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
