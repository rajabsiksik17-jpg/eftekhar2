import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getServiceBySlug, getCategoryBySlug, getServiceBlocks, getFaqs, getGalleryItemsByService } from "@/lib/data";
import { getContactSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { ShieldAlert, CalendarCheck, Phone, Mail, MapPin } from "lucide-react";

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

  const [blocks, faqs, contact, serviceBeforeAfter, serviceGallery] = await Promise.all([
    getServiceBlocks(service.id),
    getFaqs({ serviceId: service.id }),
    getContactSettings(),
    getGalleryItemsByService(service.id, "before_after"),
    getGalleryItemsByService(service.id, "normal"),
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
            {(lang === "ar" ? service.content_ar : service.content_en) && (
              <div className="leading-relaxed text-ink-secondary">
                {lang === "ar" ? service.content_ar : service.content_en}
              </div>
            )}

            {blocks.map((b) => (
              <div key={b.id}>
                {b.title_ar && (
                  <h2 className="mb-3 text-xl font-bold text-brand-950">
                    {lang === "ar" ? b.title_ar : b.title_en}
                  </h2>
                )}
                {b.block_type === "text" && b.content_ar && (
                  <div className="leading-relaxed text-ink-secondary">
                    {lang === "ar" ? b.content_ar : b.content_en}
                  </div>
                )}
                {b.block_type === "image" && (b.media as { image?: string })?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(b.media as { image: string }).image} alt={lang === "ar" ? b.title_ar ?? "" : b.title_en ?? ""} className="w-full rounded-2xl object-cover shadow-card" loading="lazy" />
                )}
                {b.block_type === "video" && (b.media as { youtube_url?: string })?.youtube_url && (
                  <YouTubeEmbed url={(b.media as { youtube_url: string }).youtube_url} title={lang === "ar" ? b.title_ar ?? undefined : b.title_en ?? undefined} className="shadow-card" />
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

            <div className="card flex gap-3 border border-gold-200 bg-gold-50 p-5 text-sm text-ink-secondary">
              <ShieldAlert className="h-5 w-5 shrink-0 text-gold-600" />
              <p>
                {lang === "ar"
                  ? "تنبيه طبي: النتائج تختلف من حالة لأخرى، ويتم تحديد مدى ملاءمة أي إجراء بعد التقييم الطبي ومناقشة الخيارات والفوائد والمخاطر مع الطبيب المختص. لا تُعد هذه المعلومات بديلاً عن الاستشارة الطبية."
                  : "Medical notice: results vary by case. The suitability of any procedure is determined after medical assessment and discussion of options, benefits and risks with the specialist. This information is not a substitute for medical consultation."}
              </p>
            </div>

            {serviceBeforeAfter.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-brand-950">
                  {lang === "ar" ? `قبل وبعد ${lang === "ar" ? service.name_ar : service.name_en}` : `Before & After ${service.name_en}`}
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {serviceBeforeAfter.map((it) => (
                    <figure key={it.id}>
                      <BeforeAfterSlider
                        before={it.before_image ?? ""}
                        after={it.after_image ?? ""}
                        beforeLabel={lang === "ar" ? "قبل" : "Before"}
                        afterLabel={lang === "ar" ? "بعد" : "After"}
                        alt={lang === "ar" ? it.title_ar ?? "" : it.title_en ?? ""}
                      />
                      {(it.title_ar || it.title_en) && (
                        <figcaption className="mt-2 text-center text-sm font-medium text-ink-secondary">
                          {lang === "ar" ? it.title_ar : it.title_en}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {serviceGallery.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-brand-950">
                  {lang === "ar" ? `معرض صور ${service.name_ar}` : `${service.name_en} Gallery`}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {serviceGallery.map((it) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={it.id}
                      src={it.image ?? ""}
                      alt={it.alt_text ?? (lang === "ar" ? it.title_ar ?? "" : it.title_en ?? "")}
                      className="aspect-square w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-brand-950">
                {lang === "ar" ? "هل لديك استفسار؟" : "Have a question?"}
              </h3>
              <p className="mt-2 text-sm text-ink-secondary">
                {lang === "ar"
                  ? "احجز موعدًا للاستشارة والتقييم."
                  : "Book an appointment for consultation and assessment."}
              </p>
              <div className="mt-4 space-y-3 text-sm text-ink-secondary">
                {contact?.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Phone className="h-4 w-4" /></span>
                    <span className="phone-ltr">{contact.phone}</span>
                  </a>
                )}
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Mail className="h-4 w-4" /></span>
                    <span className="break-all">{contact.email}</span>
                  </a>
                )}
                {(contact?.address_ar || contact?.address_en) && (
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><MapPin className="h-4 w-4" /></span>
                    <span>{lang === "ar" ? contact.address_ar : contact.address_en}</span>
                  </div>
                )}
              </div>
              <Link href={`/${lang}/appointment?service=${service.slug}`} className="btn-primary btn-md mt-5 w-full">
                <CalendarCheck className="h-4 w-4" />
                {lang === "ar" ? "احجز موعد" : "Book Appointment"}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
