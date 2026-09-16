import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (items.length === 0) return null;

  const MAX = 8;
  const visible = items.slice(0, MAX);
  const showMore = items.length > MAX;

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((it) => (
            <figure key={it.id}>
              <BeforeAfterSlider
                before={it.before_image ?? ""}
                after={it.after_image ?? ""}
                beforeLabel={lang === "ar" ? "قبل" : "Before"}
                afterLabel={lang === "ar" ? "بعد" : "After"}
                alt={lang === "ar" ? it.title_ar ?? "" : it.title_en ?? ""}
              />
              {(it.title_ar || it.title_en) && (
                <figcaption className="mt-3 text-center text-sm font-medium text-ink-secondary">
                  {lang === "ar" ? it.title_ar : it.title_en}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {showMore && (
          <div className="mt-10 text-center">
            <Link href={`/${lang}/before-after`} className="btn-primary btn-md">
              {lang === "ar" ? "رؤية المزيد" : "View more"}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
