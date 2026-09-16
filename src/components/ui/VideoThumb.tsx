"use client";

import { useEffect, useRef, useState } from "react";

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

/**
 * Captures a thumbnail frame from an mp4/webm video (~5 seconds in).
 * Falls back to nothing for YouTube URLs (those use a static thumbnail).
 */
export function VideoThumb({ url, alt, className }: { url: string; alt?: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!url || isYouTube(url)) return;
    const video = document.createElement("video");
    videoRef.current = video;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = url;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    const capture = () => {
      try {
        const t = Math.min(5, (video.duration || 5) / 2);
        video.currentTime = t;
      } catch {
        /* noop */
      }
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setSrc(canvas.toDataURL("image/jpeg", 0.7));
        }
        cleanup();
      } catch {
        cleanup();
      }
    };

    video.addEventListener("loadedmetadata", capture);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", cleanup);

    return () => {
      video.removeEventListener("loadedmetadata", capture);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", cleanup);
      cleanup();
    };
  }, [url]);

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} className={className} />;
}
