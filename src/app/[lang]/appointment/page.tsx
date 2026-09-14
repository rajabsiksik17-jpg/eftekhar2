import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getCategories, getDoctors, getServices } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ service?: string; category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: langParam } = await params;
  return buildMetadata({ lang: langParam as Lang, route: "/appointment" });
}

export default async function AppointmentPage({ params, searchParams }: Props) {
  const [{ lang: langParam }, sp] = await Promise.all([params, searchParams]);
  const lang = langParam as Lang;
  const [categories, services, doctors, settings] = await Promise.all([
    getCategories(),
    getServices(),
    getDoctors("doctor"),
    getSiteSettings(),
  ]);

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
          <AppointmentForm
            lang={lang}
            categories={categories}
            services={services}
            doctors={doctors}
            settings={settings.appointment}
            defaultCategorySlug={sp.category}
            defaultServiceSlug={sp.service}
          />
          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-bold text-brand-950">{lang === "ar" ? "معلومات مهمة" : "Important Information"}</h2>
              <ul className="mt-4 space-y-2 text-sm text-brand-700/90">
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
