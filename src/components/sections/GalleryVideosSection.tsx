"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { GalleryItem, Video } from "@/lib/types";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { youtubeThumbnail } from "@/components/ui/YouTubeEmbed";
import { VideoThumb } from "@/components/ui/VideoThumb";
import { ChevronLeft, ChevronRight, Images, Play, X, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GalleryVideosSection({
  title,
  subtitle,
  gallery,
  videos,
  lang,
}: {
  title?: string | null;
  subtitle?: string | null;
  gallery: GalleryItem[];
  videos: Video[];
  lang: Lang;
}) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const images = gallery.slice(0, 9);
  const PrevIcon = lang === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = lang === "ar" ? ChevronLeft : ChevronRight;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const scroll = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="py-20">
      <div className="container-px">
        {(title || subtitle) && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Images className="h-5 w-5 text-brand-600" />
                {lang === "ar" ? "معرض الصور" : "Gallery"}
              </h3>
              <Link href={`/${lang}/gallery`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
                {lang === "ar" ? "رؤية المزيد" : "View more"}
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((it) => (
                <Link key={it.id} href={`/${lang}/gallery`} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image ?? it.after_image ?? ""}
                    alt={it.alt_text ?? (lang === "ar" ? it.title_ar ?? "" : it.title_en ?? "")}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </Link>
              ))}
              {images.length === 0 && (
                <div className="col-span-3 flex aspect-square items-center justify-center rounded-xl border border-dashed border-brand-300 bg-brand-50 text-brand-400">
                  {lang === "ar" ? "لا توجد صور بعد" : "No images yet"}
                </div>
              )}
            </div>
          </div>

          {/* Videos slider */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Play className="h-5 w-5 text-brand-600" />
                {lang === "ar" ? "معرض الفيديوهات" : "Videos"}
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50">
                  <PrevIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scroll(1)} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50">
                  <NextIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {videos.length === 0 ? (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-brand-300 bg-brand-50 text-brand-400">
                {lang === "ar" ? "لا توجد فيديوهات بعد" : "No videos yet"}
              </div>
            ) : (
              <div ref={trackRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {videos.map((v) => {
                  const thumb = v.thumbnail ?? youtubeThumbnail(v.youtube_url);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveVideo(v)}
                      className="group w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-brand-950/10 bg-white text-start shadow-card"
                    >
                      <div className="relative aspect-[9/16] w-full bg-brand-100">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={lang === "ar" ? v.title_ar : v.title_en} className="h-full w-full object-cover" />
                        ) : (
                          <VideoThumb url={v.youtube_url} alt={lang === "ar" ? v.title_ar : v.title_en} className="h-full w-full object-cover" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-brand-950/30">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-700 transition group-hover:scale-110">
                            <Play className="h-5 w-5" />
                          </span>
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="line-clamp-1 text-sm font-semibold text-ink">{lang === "ar" ? v.title_ar : v.title_en}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeVideo && (
        <div className="modal-backdrop" onClick={() => setActiveVideo(null)}>
          <button type="button" onClick={() => setActiveVideo(null)} aria-label="Close" className="absolute top-5 end-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <VideoPlayer
              config={{
                url: activeVideo.youtube_url,
                autoplay: true,
                muted: activeVideo.muted,
                loop: activeVideo.loop,
                controls: activeVideo.controls,
                start: activeVideo.start_time ?? undefined,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
