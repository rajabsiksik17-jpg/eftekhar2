"use client";

import { MediaPicker } from "@/components/admin/MediaPicker";
import { Video } from "lucide-react";

/**
 * Video input: YouTube URL or an uploaded/picked video file from the library.
 */
export function VideoInput({
  value,
  onChange,
  placeholder = "https://youtube.com/watch?v=... أو رابط ملف mp4",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Video className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
        <input className="input ps-9" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
      <MediaPicker value={value} onChange={onChange} accept="video" />
    </div>
  );
}
