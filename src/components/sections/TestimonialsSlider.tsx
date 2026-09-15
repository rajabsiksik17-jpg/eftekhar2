"use client";

import { useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestimonialsSlider({
  title,
  testimonials,
  lang,
}: {
  title?: string | null;
  testimonials: Testimonial[];
  lang: Lang;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  if (testimonials.length === 0) return null;

  const t = testimonials[Math.min(index, testimonials.length - 1)];
  const name = lang === "ar" ? t.name_ar : t.name_en;
  const review = lang === "ar" ? t.review_ar : t.review_en;
  const count = testimonials.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const PrevIcon = lang === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <SectionHeading title={title} />
        <div className="relative mx-auto max-w-3xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <Quote className="absolute top-6 start-6 h-10 w-10 text-brand-100" />
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-5 w-5", i < t.rating ? "fill-gold-400 text-gold-400" : "text-brand-200")}
                />
              ))}
            </div>
            <p className="text-lg leading-relaxed text-ink-secondary">“{review}”</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {t.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image} alt={name ?? ""} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
                  {(name ?? "?").charAt(0)}
                </span>
              )}
              <div className="text-start">
                <div className="font-semibold text-ink">{name}</div>
                {t.source === "google" && (
                  <div className="text-xs text-ink-muted">
                    Google{t.is_demo ? ` · ${lang === "ar" ? "مراجعة تجريبية" : "Demo review"}` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label={lang === "ar" ? "السابق" : "Previous"}
                className="absolute top-1/2 start-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-card transition hover:bg-brand-50 sm:-start-5"
              >
                <PrevIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label={lang === "ar" ? "التالي" : "Next"}
                className="absolute top-1/2 end-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-card transition hover:bg-brand-50 sm:-end-5"
              >
                <NextIcon className="h-5 w-5" />
              </button>
              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Testimonial ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === index ? "w-8 bg-brand-600" : "w-2 bg-brand-200 hover:bg-brand-300",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
