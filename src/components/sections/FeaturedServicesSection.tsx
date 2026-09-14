import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection, Service, ServiceCategory } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";

export function FeaturedServicesSection({
  section,
  services,
  categories,
  lang,
}: {
  section: PageSection;
  services: Service[];
  categories: ServiceCategory[];
  lang: Lang;
}) {
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              category={categories.find((c) => c.id === s.category_id)}
              lang={lang}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href={`/${lang}/services`} className="btn-outline btn-md">
            {lang === "ar" ? "عرض جميع الخدمات" : "View all services"}
          </Link>
        </div>
      </div>
    </section>
  );
}
