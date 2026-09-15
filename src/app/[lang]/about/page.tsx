import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getPageBySlug, getPageSections } from "@/lib/data";
import { getContactSettings, getSiteSettings } from "@/lib/settings";
import { getFormByKey, getFormFields } from "@/lib/forms";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/icons";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { ImageTextSection } from "@/components/sections/ImageTextSection";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { PageSection } from "@/lib/types";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return buildMetadata({ lang, route: "/about" });
}

export default async function AboutPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const page = await getPageBySlug("about");
  if (!page) notFound();
  const [sections, contact, settings, form] = await Promise.all([
    getPageSections(page.id),
    getContactSettings(),
    getSiteSettings(),
    getFormByKey("contact"),
  ]);

  const intro = sections.find((s) => s.section_type === "introduction");
  const texts = sections.filter((s) => s.section_type === "text");
  const imageTexts = sections.filter((s) => s.section_type === "image_text");
  const fields = form ? await getFormFields(form.id) : [];

  const crumb = { label: lang === "ar" ? "من نحن" : "About Us" };
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <>
      <PageHero
        title={lang === "ar" ? page.title_ar ?? "" : page.title_en ?? ""}
        breadcrumb={<Breadcrumbs items={[crumb]} lang={lang} />}
      />

      {intro && <AboutIntro section={intro} lang={lang} />}

      {texts.length > 0 && (
        <section className="pb-20">
          <div className="container-px grid gap-6 md:grid-cols-2">
            {texts.map((t) => <AboutCard key={t.id} section={t} lang={lang} />)}
          </div>
        </section>
      )}

      {imageTexts.map((s) => (
        <ImageTextSection key={s.id} section={s} lang={lang} />
      ))}

      {form && (
        <section className="bg-brand-50/50 py-20">
          <div className="container-px">
            <SectionHeading title={t("تواصل معنا", "Contact Us")} />
            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
              <div className="space-y-4">
                {contact?.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="card flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Phone className="h-5 w-5" /></span>
                    <div>
                      <div className="text-sm font-bold text-ink">{t("الهاتف", "Phone")}</div>
                      <div className="phone-ltr text-brand-600">{contact.phone}</div>
                    </div>
                  </a>
                )}
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="card flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Mail className="h-5 w-5" /></span>
                    <div>
                      <div className="text-sm font-bold text-ink">{t("البريد الإلكتروني", "Email")}</div>
                      <div className="text-brand-600">{contact.email}</div>
                    </div>
                  </a>
                )}
                {(contact?.address_ar || contact?.address_en) && (
                  <div className="card flex items-start gap-4 p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><MapPin className="h-5 w-5" /></span>
                    <div>
                      <div className="text-sm font-bold text-ink">{t("العنوان", "Address")}</div>
                      <div className="text-brand-600">{lang === "ar" ? contact.address_ar : contact.address_en}</div>
                    </div>
                  </div>
                )}
                {Array.isArray(contact?.working_hours) && (contact.working_hours as Record<string, string>[]).length > 0 && (
                  <div className="card flex items-start gap-4 p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><Clock className="h-5 w-5" /></span>
                    <div>
                      <div className="text-sm font-bold text-ink">{t("ساعات العمل", "Working Hours")}</div>
                      {(contact.working_hours as Record<string, string>[]).map((w, i) => (
                        <div key={i} className="text-brand-600">
                          {lang === "ar" ? w.days_ar : w.days_en}: {lang === "ar" ? w.hours_ar : w.hours_en}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card p-6 sm:p-8">
                <DynamicForm
                  form={form}
                  fields={fields}
                  lang={lang}
                  context={{
                    categories: [],
                    services: [],
                    doctors: [],
                    defaultCountry: settings.appointment.default_country,
                    consentText: settings.appointment.consent_text_ar,
                    consentTextEn: settings.appointment.consent_text_en,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function AboutIntro({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = section.content as {
    ar?: { text?: string; features?: { icon?: string; title?: string; text?: string }[] };
    en?: { text?: string; features?: { icon?: string; title?: string; text?: string }[] };
  };
  const localized = lang === "ar" ? content.ar : content.en;
  const features = localized?.features ?? [];

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading
          title={lang === "ar" ? section.title_ar : section.title_en}
          subtitle={lang === "ar" ? section.subtitle_ar : section.subtitle_en}
        />
        {localized?.text && (
          <p className="mx-auto mb-12 max-w-3xl text-center leading-relaxed text-ink-secondary">
            {localized.text}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {features.map((f, i) => (
            <div key={i} className="card p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={f.icon} className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-brand-950">{f.title}</div>
              {f.text && <div className="mt-1 text-xs text-brand-600">{f.text}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCard({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = section.content as {
    ar?: { text?: string; icon?: string };
    en?: { text?: string; icon?: string };
  };
  const localized = lang === "ar" ? content.ar : content.en;
  return (
    <div className="card flex gap-4 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Icon name={localized?.icon} className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-950">
          {lang === "ar" ? section.title_ar : section.title_en}
        </h3>
        <p className="mt-2 leading-relaxed text-ink-secondary">{localized?.text}</p>
      </div>
    </div>
  );
}
