import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getCategories, getDoctors, getServices } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { getFormByKey, getFormFields } from "@/lib/forms";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DynamicForm } from "@/components/forms/DynamicForm";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ service?: string; category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({ lang: lang as Lang, route: "/appointment" });
}

export default async function AppointmentPage({ params, searchParams }: Props) {
  const [{ lang: langParam }, sp] = await Promise.all([params, searchParams]);
  const lang = langParam as Lang;

  const [form, categories, services, doctors, settings] = await Promise.all([
    getFormByKey("appointment"),
    getCategories(),
    getServices(),
    getDoctors("doctor"),
    getSiteSettings(),
  ]);

  if (!form) return null;
  const fields = await getFormFields(form.id);

  const categoryId = categories.find((c) => c.slug === sp.category)?.id;
  const serviceId = services.find((s) => s.slug === sp.service)?.id;

  return (
    <>
      <PageHero
        title={lang === "ar" ? "حجز موعد" : "Book Appointment"}
        subtitle={
          lang === "ar"
            ? "املأ النموذج وسنتواصل معك لتأكيد الموعد."
            : "Fill in the form and we will contact you to confirm your appointment."
        }
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "حجز موعد" : "Book Appointment" }]} lang={lang} />}
      />

      <section className="py-16">
        <div className="container-px grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="card p-6 sm:p-8">
            <DynamicForm
              form={form}
              fields={fields}
              lang={lang}
              context={{
                categories,
                services,
                doctors,
                defaultCountry: settings.appointment.default_country,
                consentText: settings.appointment.consent_text_ar,
                consentTextEn: settings.appointment.consent_text_en,
              }}
              defaults={{ category: categoryId ?? "", service: serviceId ?? "" }}
            />
          </div>
          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-bold text-brand-950">{lang === "ar" ? "معلومات مهمة" : "Important Information"}</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
                <li>{lang === "ar" ? "• سيتم تأكيد الموعد عبر الهاتف." : "• The appointment will be confirmed by phone."}</li>
                <li>{lang === "ar" ? "• الرجاء الحضور قبل الموعد بوقت كافٍ." : "• Please arrive ahead of your appointment."}</li>
                <li>{lang === "ar" ? "• الاستشارة والتقييم لا يشكلان التزامًا بأي إجراء." : "• Consultation and assessment do not commit to any procedure."}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
