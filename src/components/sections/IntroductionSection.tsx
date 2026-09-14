import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { Icon } from "@/components/icons";
import { SectionHeading } from "@/components/sections/SectionHeading";

interface Feature {
  icon?: string;
  title?: string;
  text?: string;
}
interface Content {
  ar?: { text?: string; features?: Feature[] };
  en?: { text?: string; features?: Feature[] };
}

export function IntroductionSection({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const localized = lang === "ar" ? content.ar : content.en;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const features = localized?.features ?? [];

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        {localized?.text && (
          <p className="mx-auto mb-12 max-w-3xl whitespace-pre-line text-center leading-relaxed text-brand-800/90">
            {localized.text}
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="card group p-6 text-center transition hover:shadow-soft">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={f.icon} className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-brand-950">{f.title}</h3>
              {f.text && <p className="mt-2 text-sm leading-relaxed text-brand-700/80">{f.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
