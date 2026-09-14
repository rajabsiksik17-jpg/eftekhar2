import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { getPageBySlug, getPageSections } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Icon } from "@/components/icons";
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
  const sections = await getPageSections(page.id);

  const intro = sections.find((s) => s.section_type === "introduction");
  const texts = sections.filter((s) => s.section_type === "text");

  const crumb = { label: lang === "ar" ? "من نحن" : "About Us" };

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
          <p className="mx-auto mb-12 max-w-3xl text-center leading-relaxed text-brand-800/90">
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
        <p className="mt-2 leading-relaxed text-brand-700/90">{localized?.text}</p>
      </div>
    </div>
  );
}
