import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { Check } from "lucide-react";

interface VideoCfg {
  youtube_url?: string;
  thumbnail?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  start_time?: number;
}
interface Bullet {
  icon?: string;
  ar?: string;
  en?: string;
}
interface Cta {
  label_ar?: string;
  label_en?: string;
  url?: string;
}
interface Content {
  ar?: { text?: string };
  en?: { text?: string };
  video?: VideoCfg;
  bullets?: Bullet[];
  cta?: Cta;
}

export function VideoContentSection({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const text = lang === "ar" ? content.ar?.text : content.en?.text;
  const video = content.video ?? {};
  const bullets = content.bullets ?? [];
  const cta = content.cta;

  const href = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <YouTubeEmbed
            url={video.youtube_url ?? ""}
            title={title ?? undefined}
            autoplay={video.autoplay}
            muted={video.muted}
            loop={video.loop}
            controls={video.controls}
            start={video.start_time}
            className="shadow-soft"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading title={title} subtitle={subtitle} align="start" className="mb-5" />
          {text && <p className="whitespace-pre-line leading-relaxed text-ink-secondary">{text}</p>}
          {bullets.length > 0 && (
            <ul className="mt-6 space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-ink-secondary">{lang === "ar" ? b.ar : b.en}</span>
                </li>
              ))}
            </ul>
          )}
          {cta && (
            <Link href={href(cta.url)} className="btn-primary btn-md mt-8">
              {lang === "ar" ? cta.label_ar : cta.label_en}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
