"use client";

import { cn } from "@/lib/utils";

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m ? m[1] : null;
}

export function YouTubeEmbed({
  url,
  title,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  start,
  className,
}: {
  url: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  start?: number;
  className?: string;
}) {
  const id = youtubeId(url);
  if (!id) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-brand-100 text-sm text-brand-600",
          className,
        )}
      >
        {title ?? ""}
      </div>
    );
  }

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  if (muted) params.set("mute", "1");
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }
  if (!controls) params.set("controls", "0");
  if (start) params.set("start", String(start));

  return (
    <iframe
      className={cn("aspect-video w-full rounded-2xl", className)}
      src={`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`}
      title={title ?? "Video"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
}

export function youtubeThumbnail(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
