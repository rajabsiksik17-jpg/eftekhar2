import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getContactSettings, getSiteSettings } from "@/lib/settings";
import { getFormByKey, getFormFields } from "@/lib/forms";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({ lang: lang as Lang, route: "/contact" });
}

export default async function ContactPage({ params }: Props) {
  const { lang: langParam } = await params;
  const lang = langParam as Lang;

  const [form, contact, settings] = await Promise.all([
    getFormByKey("contact"),
    getContactSettings(),
    getSiteSettings(),
  ]);
  if (!form) return null;
  const fields = await getFormFields(form.id);

  const workingHours = (Array.isArray(contact?.working_hours) ? contact.working_hours : []) as Record<string, string>[];
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <>
      <PageHero
        title={t("تواصل مع افتخار", "Contact Eftekar")}
        subtitle={t(
          "نحن دائمًا بالقرب منك — تواصل معنا واحصل على المعلومات التي تحتاجها أو احجز موعدك.",
          "We are always near you — contact us for the information you need or book your appointment.",
        )}
        breadcrumb={<Breadcrumbs items={[{ label: t("تواصل معنا", "Contact Us") }]} lang={lang} />}
      />

      <section className="py-16">
        <div className="container-px grid gap-10 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            {contact?.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="card flex items-center gap-4 p-5 transition hover:shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Phone className="h-5 w-5" /></span>
                <div>
                  <div className="text-sm font-bold text-brand-950">{t("الهاتف", "Phone")}</div>
                  <div className="phone-ltr text-brand-600">{contact.phone}</div>
                </div>
              </a>
            )}
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="card flex items-center gap-4 p-5 transition hover:shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Mail className="h-5 w-5" /></span>
                <div>
                  <div className="text-sm font-bold text-brand-950">{t("البريد الإلكتروني", "Email")}</div>
                  <div className="text-brand-600">{contact.email}</div>
                </div>
              </a>
            )}
            <div className="card flex items-start gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><MapPin className="h-5 w-5" /></span>
              <div>
                <div className="text-sm font-bold text-brand-950">{t("العنوان", "Address")}</div>
                <div className="text-brand-600">{lang === "ar" ? contact?.address_ar : contact?.address_en}</div>
              </div>
            </div>
            {workingHours.length > 0 && (
              <div className="card flex items-start gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><Clock className="h-5 w-5" /></span>
                <div>
                  <div className="text-sm font-bold text-brand-950">{t("ساعات العمل", "Working Hours")}</div>
                  {workingHours.map((w, i) => (
                    <div key={i} className="text-brand-600">
                      {lang === "ar" ? w.days_ar : w.days_en}: {lang === "ar" ? w.hours_ar : w.hours_en}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {contact?.google_maps_url && (
              <a href={contact.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-md w-full">
                <MapPin className="h-4 w-4" />
                {t("فتح الموقع على الخريطة", "Open location on map")}
              </a>
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
      </section>
    </>
  );
}
