import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { Icon } from "@/components/icons";
import { Video } from "lucide-react";

interface VideoCfg {
  youtube_url?: string;
  thumbnail?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  start_time?: number;
}
interface Feature {
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
  features?: Feature[];
  bullets?: Feature[];
  cta?: Cta;
}

export function VideoContentSection({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const text = lang === "ar" ? content.ar?.text : content.en?.text;
  const video = content.video ?? {};
  const features = content.features ?? content.bullets ?? [];
  const cta = content.cta;

  const href = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />

        {text && (
          <p className="mx-auto -mt-4 mb-10 max-w-2xl text-center leading-relaxed text-ink-secondary">
            {text}
          </p>
        )}

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            {video.youtube_url ? (
              <YouTubeEmbed
                url={video.youtube_url}
                title={title ?? undefined}
                autoplay={video.autoplay}
                muted={video.muted}
                loop={video.loop}
                controls={video.controls}
                start={video.start_time}
                className="shadow-soft"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 text-brand-400">
                <Video className="h-12 w-12" />
                <p className="text-sm font-medium">
                  {lang === "ar" ? "لا يوجد فيديو حالياً" : "No video available yet"}
                </p>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            {features.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-brand-950/5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <Icon name={f.icon} className="h-5 w-5" />
                    </span>
                    <span className="pt-1 text-sm font-semibold text-ink">{lang === "ar" ? f.ar : f.en}</span>
                  </div>
                ))}
              </div>
            )}

            {cta && (
              <Link href={href(cta.url)} className="btn-primary btn-md mt-8">
                {lang === "ar" ? cta.label_ar : cta.label_en}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
