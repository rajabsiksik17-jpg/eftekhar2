"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Video } from "@/lib/types";
import { youtubeThumbnail } from "@/components/ui/YouTubeEmbed";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { VideoThumb } from "@/components/ui/VideoThumb";
import { Play, X } from "lucide-react";

export function VideoGallery({ videos, lang }: { videos: Video[]; lang: Lang }) {
  const [active, setActive] = useState<Video | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const thumb = v.thumbnail ?? youtubeThumbnail(v.youtube_url);
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v)}
              className="card group overflow-hidden text-start"
            >
              <div className="relative aspect-video w-full bg-brand-100">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={lang === "ar" ? v.title_ar : v.title_en} className="h-full w-full object-cover" />
                ) : (
                  <VideoThumb url={v.youtube_url} alt={lang === "ar" ? v.title_ar : v.title_en} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-brand-950/30 opacity-90 transition group-hover:bg-brand-950/40">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-lg transition group-hover:scale-110">
                    <Play className="h-6 w-6" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-brand-950">{lang === "ar" ? v.title_ar : v.title_en}</h3>
                {(v.description_ar || v.description_en) && (
                  <p className="mt-1 line-clamp-2 text-sm text-brand-600">
                    {lang === "ar" ? v.description_ar : v.description_en}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute top-5 end-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <VideoPlayer
              config={{
                url: active.youtube_url,
                autoplay: true,
                muted: active.muted,
                loop: active.loop,
                controls: active.controls,
                start: active.start_time ?? undefined,
                ratio: active.ratio as "video" | "square" | "portrait" | "wide" | undefined,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
