import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getCategoryBySlug, getServicesByCategory, getFaqs } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Icon } from "@/components/icons";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ lang: string; category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: langParam, category: categorySlug } = await params;
  const lang = langParam as Lang;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return buildMetadata({ lang, route: "/services" });
  return buildMetadata({
    lang,
    route: `/services/${category.slug}`,
    title: lang === "ar" ? category.seo_title_ar ?? undefined : category.seo_title_en ?? undefined,
    description: lang === "ar" ? category.seo_description_ar ?? undefined : category.seo_description_en ?? undefined,
    keywords: lang === "ar" ? category.seo_keywords_ar ?? undefined : category.seo_keywords_en ?? undefined,
    ogImage: category.og_image,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { lang: langParam, category: categorySlug } = await params;
  const lang = langParam as Lang;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [services, faqs] = await Promise.all([
    getServicesByCategory(category.id),
    getFaqs({ categoryId: category.id }),
  ]);

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHero
        title={lang === "ar" ? category.name_ar : category.name_en}
        subtitle={lang === "ar" ? category.description_ar : category.description_en}
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: lang === "ar" ? "الخدمات" : "Services", href: `/${lang}/services` },
              { label: lang === "ar" ? category.name_ar : category.name_en },
            ]}
            lang={lang}
          />
        }
      />

      {category.content_ar && (
        <section className="py-12">
          <div className="container-px">
            <p className="mx-auto max-w-3xl whitespace-pre-line text-center leading-relaxed text-ink-secondary">
              {lang === "ar" ? category.content_ar : category.content_en}
            </p>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="container-px">
          <h2 className="mb-6 text-2xl font-bold text-brand-950">
            {lang === "ar" ? "الخدمات" : "Services"}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/${lang}/services/${category.slug}/${s.slug}`}
                className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-brand-950">{lang === "ar" ? s.name_ar : s.name_en}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-secondary">
                  {lang === "ar" ? s.description_ar : s.description_en}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  {lang === "ar" ? "التفاصيل" : "Details"}
                  <Arrow className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-brand-50/50 py-16">
          <div className="container-px max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-950">
              {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
            </h2>
            <FaqAccordion faqs={faqs} lang={lang} />
          </div>
        </section>
      )}
    </>
  );
}
