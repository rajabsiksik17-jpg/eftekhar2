import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { getCategories, getServices } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/icons";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return buildMetadata({ lang, route: "/services" });
}

export default async function ServicesPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const [categories, services] = await Promise.all([getCategories(), getServices()]);
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHero
        title={lang === "ar" ? "خدماتنا" : "Our Services"}
        subtitle={
          lang === "ar"
            ? "خدمات طبية وتجميلية متكاملة بإشراف أطباء مختصين."
            : "Integrated medical and cosmetic services supervised by specialists."
        }
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "الخدمات" : "Services" }]} lang={lang} />}
      />

      <section className="py-16">
        <div className="container-px space-y-12">
          {categories.map((cat) => {
            const catServices = services.filter((s) => s.category_id === cat.id);
            return (
              <div key={cat.id}>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Icon name={cat.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-brand-950">
                      {lang === "ar" ? cat.name_ar : cat.name_en}
                    </h2>
                    <p className="text-sm text-brand-600">
                      {lang === "ar" ? cat.description_ar : cat.description_en}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catServices.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${lang}/services/${cat.slug}/${s.slug}`}
                      className="card group flex items-center gap-4 overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-soft"
                    >
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={lang === "ar" ? s.name_ar : s.name_en} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                          <Icon name={s.icon} className="h-7 w-7" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-brand-950">
                          {lang === "ar" ? s.name_ar : s.name_en}
                        </div>
                        <div className="line-clamp-2 text-sm text-ink-secondary">
                          {lang === "ar" ? s.description_ar : s.description_en}
                        </div>
                      </div>
                      <Arrow className="h-5 w-5 shrink-0 text-brand-400 transition group-hover:text-brand-600" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
