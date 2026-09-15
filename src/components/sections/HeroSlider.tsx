"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { HeroSlide } from "@/lib/types";
import { Icon } from "@/components/icons";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideButton {
  label_ar?: string;
  label_en?: string;
  url?: string;
  variant?: string;
}
interface Bullet {
  icon?: string;
  ar?: string;
  en?: string;
}

export function HeroSlider({ slides, lang }: { slides: HeroSlide[]; lang: Lang }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const single = slides.length <= 1;

  const go = useCallback(
    (i: number) => {
      if (single) return;
      setIndex((i + slides.length) % slides.length);
    },
    [single, slides.length],
  );

  useEffect(() => {
    if (single || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [single, paused, slides.length]);

  const slide = slides[index];
  if (!slide) return null;

  const title = lang === "ar" ? slide.title_ar : slide.title_en;
  const subtitle = lang === "ar" ? slide.subtitle_ar : slide.subtitle_en;
  const description = lang === "ar" ? slide.description_ar : slide.description_en;
  const bullets = (Array.isArray(slide.bullets) ? slide.bullets : []) as Bullet[];
  const primary = slide.primary_button as SlideButton | null;
  const secondary = slide.secondary_button as SlideButton | null;
  const bgImage = slide.background_image || slide.image;
  const align = slide.text_align === "center" ? "center" : slide.text_align;
  const pos = slide.content_position === "center" ? "center" : slide.content_position;

  const href = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}
      {slide.background_color && (
        <div className="absolute inset-0" style={{ backgroundColor: slide.background_color }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-950/60 to-brand-950/80" />
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${slide.overlay})` }} />

      <div
        className={cn(
          "container-px relative flex min-h-[560px] items-center py-20 lg:min-h-[680px]",
          align === "center" ? "justify-center text-center" : "justify-start text-start",
          pos === "center" ? "items-center" : pos === "top" ? "items-start" : "items-end",
        )}
      >
        <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
          {subtitle && (
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 backdrop-blur">
              {subtitle}
            </span>
          )}
          <h1 className="text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-6xl">{title}</h1>
          {description && (
            <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">{description}</p>
          )}

          {bullets.length > 0 && (
            <ul className={cn("mt-6 grid gap-3 sm:grid-cols-2", align === "center" && "justify-center")}>
              {bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium">
                  {b.icon ? (
                    <Icon name={b.icon} className="h-4 w-4 text-gold-400" />
                  ) : (
                    <Check className="h-4 w-4 text-gold-400" />
                  )}
                  {lang === "ar" ? b.ar : b.en}
                </li>
              ))}
            </ul>
          )}

          <div className={cn("mt-8 flex flex-wrap gap-3", align === "center" && "justify-center")}>
            {primary && (
              <Link href={href(primary.url)} className="btn-gold btn-lg">
                {lang === "ar" ? primary.label_ar : primary.label_en}
              </Link>
            )}
            {secondary && (
              <Link href={href(secondary.url)} className="btn-outline btn-lg border-white/30 bg-white/10 text-white hover:bg-white/20">
                {lang === "ar" ? secondary.label_ar : secondary.label_en}
              </Link>
            )}
          </div>
        </div>
      </div>

      {!single && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={lang === "ar" ? "السابق" : "Previous"}
            className="absolute top-1/2 start-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
          >
            {lang === "ar" ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={lang === "ar" ? "التالي" : "Next"}
            className="absolute top-1/2 end-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
          >
            {lang === "ar" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-gold-400" : "w-2 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
