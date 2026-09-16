"use client";

import { useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (testimonials.length === 0) return null;

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 10);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);
  };

  const PrevIcon = lang === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title={title} align="start" className="mb-8" />
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button type="button" onClick={() => scrollBy(-1)} disabled={atStart} aria-label={lang === "ar" ? "السابق" : "Previous"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
              <PrevIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={atEnd} aria-label={lang === "ar" ? "التالي" : "Next"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
              <NextIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={trackRef} onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => {
            const name = lang === "ar" ? t.name_ar : t.name_en;
            const review = lang === "ar" ? t.review_ar : t.review_en;
            return (
              <div key={t.id} data-card
                className="card w-[85%] shrink-0 snap-start p-6 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < t.rating ? "fill-gold-400 text-gold-400" : "text-brand-200")} />
                  ))}
                </div>
                <p className="min-h-[80px] text-sm leading-relaxed text-ink-secondary">“{review}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-brand-950/10 pt-4">
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt={name ?? ""} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {(name ?? "?").charAt(0)}
                    </span>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-ink">{name}</div>
                    {t.source === "google" && (
                      <div className="text-xs text-ink-muted">
                        Google{t.is_demo ? ` · ${lang === "ar" ? "مراجعة تجريبية" : "Demo review"}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
