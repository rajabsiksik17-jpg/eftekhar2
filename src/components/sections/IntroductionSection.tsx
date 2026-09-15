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
  image?: string;
  ar?: { text?: string; features?: Feature[]; image?: string };
  en?: { text?: string; features?: Feature[]; image?: string };
}

export function IntroductionSection({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const localized = lang === "ar" ? content.ar : content.en;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const features = localized?.features ?? [];
  const image = content.image ?? localized?.image;

  return (
    <section className="py-20">
      <div className="container-px">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading title={title} subtitle={subtitle} align="start" className="mb-6" />
            {localized?.text && (
              <p className="whitespace-pre-line leading-relaxed text-ink-secondary">{localized.text}</p>
            )}

            {features.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div key={i} className="card group flex gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon name={f.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">{f.title}</h3>
                      {f.text && <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{f.text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {image && (
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100 to-accent-100 opacity-60" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title ?? ""}
                className="w-full rounded-3xl object-cover shadow-soft ring-1 ring-brand-950/5"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
