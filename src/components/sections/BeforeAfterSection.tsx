import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

export function BeforeAfterSection({
  section,
  items,
  lang,
}: {
  section: PageSection;
  items: { id: string; before_image: string | null; after_image: string | null; title_ar: string | null; title_en: string | null }[];
  lang: Lang;
}) {
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;

  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <figure key={it.id}>
              <BeforeAfterSlider
                before={it.before_image ?? ""}
                after={it.after_image ?? ""}
                beforeLabel={lang === "ar" ? "قبل" : "Before"}
                afterLabel={lang === "ar" ? "بعد" : "After"}
                alt={lang === "ar" ? it.title_ar ?? "" : it.title_en ?? ""}
              />
              {(it.title_ar || it.title_en) && (
                <figcaption className="mt-3 text-center text-sm font-medium text-brand-800">
                  {lang === "ar" ? it.title_ar : it.title_en}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
