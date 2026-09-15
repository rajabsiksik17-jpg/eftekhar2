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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {categories.map((c, i) => {
            const name = lang === "ar" ? c.name_ar : c.name_en;
            const desc = lang === "ar" ? c.description_ar : c.description_en;
            // 2 wide cards in the first row, 3 narrower cards in the second.
            const span = i < 2 ? "sm:col-span-1 lg:col-span-3" : "lg:col-span-2";
            return (
              <Link
                key={c.id}
                href={`/${lang}/services/${c.slug}`}
                className={`group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-brand-800 p-5 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${span}`}
              >
                {c.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.cover_image}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/40 to-brand-950/10 transition-opacity duration-300 group-hover:from-brand-950/95" />

                <div className="relative">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                    <Icon name={c.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold leading-snug">{name}</h3>
                  {desc && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">{desc}</p>}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition-colors group-hover:text-accent-300">
                    {lang === "ar" ? "عرض الخدمات" : "View services"}
                    <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
