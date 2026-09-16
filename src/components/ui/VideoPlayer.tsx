"use client";

import { cn } from "@/lib/utils";

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export interface VideoConfig {
  url?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
  start?: number;
}

/**
 * Unified video player: YouTube (privacy-enhanced, minimal branding) or
 * a directly-hosted file (mp4/webm) with full native controls.
 */
export function VideoPlayer({ config, className }: { config: VideoConfig; className?: string }) {
  const url = config.url ?? "";
  const autoplay = Boolean(config.autoplay);
  const muted = Boolean(config.muted);
  const loop = Boolean(config.loop);
  const controls = config.controls !== false;
  const poster = config.poster;

  if (isYouTube(url)) {
    const id = youtubeId(url);
    if (!id) {
      return <div className={cn("flex aspect-video items-center justify-center rounded-2xl bg-brand-100 text-sm text-brand-500", className)}>Video</div>;
    }
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", iv_load_policy: "3" });
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
    if (loop) { params.set("loop", "1"); params.set("playlist", id); }
    if (!controls) params.set("controls", "0");
    if (config.start) params.set("start", String(config.start));
    return (
      <iframe
        className={cn("aspect-video w-full rounded-2xl", className)}
        src={`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  if (url) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        className={cn("aspect-video w-full rounded-2xl object-cover", className)}
        src={url}
        poster={poster}
        controls={controls}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        playsInline
      />
    );
  }

  return null;
}
