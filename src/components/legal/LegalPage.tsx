import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getPageBySlug } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export async function LegalPage({ lang, slug }: { lang: Lang; slug: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        title={lang === "ar" ? page.title_ar ?? "" : page.title_en ?? ""}
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? page.title_ar ?? "" : page.title_en ?? "" }]} lang={lang} />}
      />
      <section className="py-16">
        <div className="container-px max-w-3xl">
          <article className="prose prose-brand max-w-none whitespace-pre-line leading-relaxed text-ink-secondary">
            {lang === "ar" ? page.content_ar : page.content_en}
          </article>
        </div>
      </section>
    </>
  );
}
