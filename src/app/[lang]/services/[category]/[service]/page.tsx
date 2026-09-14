import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getServiceBySlug, getCategoryBySlug, getServiceBlocks, getFaqs } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ShieldAlert, CalendarCheck } from "lucide-react";

interface Props {
  params: Promise<{ lang: string; category: string; service: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: langParam, category: categorySlug, service: serviceSlug } = await params;
  const lang = langParam as Lang;
  const service = await getServiceBySlug(serviceSlug);
  if (!service) return buildMetadata({ lang, route: "/services" });
  return buildMetadata({
    lang,
    route: `/services/${categorySlug}/${service.slug}`,
    title: lang === "ar" ? service.seo_title_ar ?? undefined : service.seo_title_en ?? undefined,
    description: lang === "ar" ? service.seo_description_ar ?? undefined : service.seo_description_en ?? undefined,
    keywords: lang === "ar" ? service.seo_keywords_ar ?? undefined : service.seo_keywords_en ?? undefined,
    ogImage: service.og_image,
  });
}

export default async function ServicePage({ params }: Props) {
  const { lang: langParam, category: categorySlug, service: serviceSlug } = await params;
  const lang = langParam as Lang;
  const service = await getServiceBySlug(serviceSlug);
  if (!service) notFound();
  const category = await getCategoryBySlug(categorySlug);

  const [blocks, faqs] = await Promise.all([
    getServiceBlocks(service.id),
    getFaqs({ serviceId: service.id }),
  ]);

  return (
    <>
      <PageHero
        title={lang === "ar" ? service.name_ar : service.name_en}
        subtitle={lang === "ar" ? service.description_ar : service.description_en}
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: lang === "ar" ? "الخدمات" : "Services", href: `/${lang}/services` },
              ...(category
                ? [
                    {
                      label: lang === "ar" ? category.name_ar : category.name_en,
                      href: `/${lang}/services/${category.slug}`,
                    },
                  ]
                : []),
              { label: lang === "ar" ? service.name_ar : service.name_en },
            ]}
            lang={lang}
          />
        }
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/appointment?service=${service.slug}`}
            className="btn-gold btn-md"
          >
            <CalendarCheck className="h-4 w-4" />
            {lang === "ar" ? "احجز موعد" : "Book Appointment"}
          </Link>
          {category && (
            <Link href={`/${lang}/services/${category.slug}`} className="btn-outline btn-md border-white/30 bg-white/10 text-white hover:bg-white/20">
              {lang === "ar" ? "جميع خدمات القسم" : "All category services"}
            </Link>
          )}
        </div>
      </PageHero>

      <section className="py-16">
        <div className="container-px grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {blocks.map((b) => (
              <div key={b.id}>
                {b.title_ar && (
                  <h2 className="mb-3 text-xl font-bold text-brand-950">
                    {lang === "ar" ? b.title_ar : b.title_en}
                  </h2>
                )}
                {b.content_ar && (
                  <div className="leading-relaxed text-brand-800/90">
                    {lang === "ar" ? b.content_ar : b.content_en}
                  </div>
                )}
              </div>
            ))}

            {faqs.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-brand-950">
                  {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
                </h2>
                <FaqAccordion faqs={faqs} lang={lang} />
              </div>
            )}

            <div className="card flex gap-3 border border-gold-200 bg-gold-50 p-5 text-sm text-brand-800">
              <ShieldAlert className="h-5 w-5 shrink-0 text-gold-600" />
              <p>
                {lang === "ar"
                  ? "تنبيه طبي: النتائج تختلف من حالة لأخرى، ويتم تحديد مدى ملاءمة أي إجراء بعد التقييم الطبي ومناقشة الخيارات والفوائد والمخاطر مع الطبيب المختص. لا تُعد هذه المعلومات بديلاً عن الاستشارة الطبية."
                  : "Medical notice: results vary by case. The suitability of any procedure is determined after medical assessment and discussion of options, benefits and risks with the specialist. This information is not a substitute for medical consultation."}
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-brand-950">
                {lang === "ar" ? "هل لديك استفسار؟" : "Have a question?"}
              </h3>
              <p className="mt-2 text-sm text-brand-700/80">
                {lang === "ar"
                  ? "احجز موعدًا للاستشارة والتقييم."
                  : "Book an appointment for consultation and assessment."}
              </p>
              <Link href={`/${lang}/appointment?service=${service.slug}`} className="btn-primary btn-md mt-4 w-full">
                {lang === "ar" ? "احجز موعد" : "Book Appointment"}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
