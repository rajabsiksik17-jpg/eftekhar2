import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getDoctors } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { User, Briefcase } from "lucide-react";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return buildMetadata({ lang, route: "/doctors" });
}

export default async function DoctorsPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const doctors = await getDoctors();

  return (
    <>
      <PageHero
        title={lang === "ar" ? "الأطباء" : "Our Doctors"}
        subtitle={
          lang === "ar"
            ? "نخبة من الأطباء والمختصين لتقديم رعاية طبية متخصصة."
            : "An elite team of doctors and specialists delivering specialized medical care."
        }
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "الأطباء" : "Doctors" }]} lang={lang} />}
      />

      <section className="py-16">
        <div className="container-px">
          {doctors.length === 0 ? (
            <p className="text-center text-ink-muted">
              {lang === "ar" ? "لا يوجد أطباء بعد." : "No doctors yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => {
                const isMedical = d.type === "doctor" || d.type === "consultant";
                return (
                  <div key={d.id} className="card overflow-hidden">
                    <div className="relative aspect-[4/3] w-full bg-brand-100">
                      {d.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.image} alt={lang === "ar" ? d.name_ar : d.name_en} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-300">
                          <User className="h-20 w-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-brand-950">
                        {lang === "ar" ? d.name_ar : d.name_en}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-600">
                        {isMedical ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                        {isMedical
                          ? lang === "ar"
                            ? d.specialty_ar
                            : d.specialty_en
                          : lang === "ar"
                            ? d.position
                            : d.position}
                      </p>
                      {isMedical && d.bio_ar && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                          {lang === "ar" ? d.bio_ar : d.bio_en}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
