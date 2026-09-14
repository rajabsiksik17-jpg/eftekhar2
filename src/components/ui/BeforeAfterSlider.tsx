"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  alt,
  className,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isRtl = getComputedStyle(el).direction === "rtl";
    let pct = ((clientX - rect.left) / rect.width) * 100;
    if (isRtl) pct = 100 - pct;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    update(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) update(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl bg-brand-100",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerLeave={stop}
      role="slider"
      aria-label={alt ?? "Before and after comparison"}
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") setPos((p) => Math.max(0, p - 5));
        if (e.key === "ArrowRight" || e.key === "ArrowUp") setPos((p) => Math.min(100, p + 5));
      }}
    >
      {/* After (base) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={alt ?? "After"} className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        dir="ltr"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt={alt ?? "Before"}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          draggable={false}
        />
      </div>

      {/* Divider */}
      <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <span className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-700 shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </span>
      </div>

      {beforeLabel && (
        <span className="absolute top-3 left-3 rounded-full bg-brand-950/70 px-3 py-1 text-xs font-medium text-white">
          {beforeLabel}
        </span>
      )}
      {afterLabel && (
        <span className="absolute top-3 right-3 rounded-full bg-brand-600/80 px-3 py-1 text-xs font-medium text-white">
          {afterLabel}
        </span>
      )}
    </div>
  );
}
