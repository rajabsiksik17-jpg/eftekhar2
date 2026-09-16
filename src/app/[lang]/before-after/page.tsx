import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getGalleryItems } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({ lang: lang as Lang, route: "/before-after" });
}

export default async function BeforeAfterPage({ params }: Props) {
  const { lang: langParam } = await params;
  const lang = langParam as Lang;
  const items = await getGalleryItems("before_after");

  return (
    <>
      <PageHero
        title={lang === "ar" ? "قبل وبعد" : "Before & After"}
        subtitle={lang === "ar" ? "نتائج حقيقية تتحدث عن نفسها." : "Real results that speak for themselves."}
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "قبل وبعد" : "Before & After" }]} lang={lang} />}
      />
      <section className="py-16">
        <div className="container-px">
          {items.length === 0 ? (
            <p className="text-center text-ink-muted">{lang === "ar" ? "لا توجد صور بعد." : "No images yet."}</p>
          ) : (
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
                    <figcaption className="mt-3 text-center text-sm font-medium text-ink-secondary">
                      {lang === "ar" ? it.title_ar : it.title_en}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
