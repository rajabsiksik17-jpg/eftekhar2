import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";

interface Cta {
  label_ar?: string;
  label_en?: string;
  url?: string;
}
interface Content {
  cta?: Cta;
}

export function FinalCta({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const cta = content.cta;

  const href = (url?: string) => {
    if (!url) return "/";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  return (
    <section className="py-20">
      <div className="container-px">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-700 to-brand-900 px-6 py-16 text-center text-white sm:px-16">
          <div className="absolute -top-20 -start-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -end-16 h-72 w-72 rounded-full bg-white/5" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">{title}</h2>
          {subtitle && <p className="relative mx-auto mt-4 max-w-xl text-brand-100/90">{subtitle}</p>}
          {cta && (
            <Link href={href(cta.url)} className="btn-gold btn-lg relative mt-8">
              {lang === "ar" ? cta.label_ar : cta.label_en}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
