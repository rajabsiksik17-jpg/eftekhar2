"use client";

import { useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Doctor } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function DoctorsSlider({
  title,
  subtitle,
  doctors,
  lang,
}: {
  title?: string | null;
  subtitle?: string | null;
  doctors: Doctor[];
  lang: Lang;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (doctors.length === 0) return null;

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 20 : 300;
    const rtl = lang === "ar";
    el.scrollBy({ left: dir * w * (rtl ? -1 : 1), behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = Math.abs(el.scrollLeft);
    setAtStart(current < 10);
    setAtEnd(current >= maxScroll - 10);
  };

  return (
    <section className="py-20">
      <div className="container-px">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title={title} subtitle={subtitle} align="start" className="mb-8" />
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {doctors.map((d) => (
            <div
              key={d.id}
              data-card
              className="card w-[85%] shrink-0 snap-start overflow-hidden sm:w-[45%] lg:w-[31%]"
            >
              <div className="relative aspect-[4/3] w-full bg-brand-100">
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image} alt={lang === "ar" ? d.name_ar : d.name_en} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand-300">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className={cn("p-5")}>
                <h3 className="text-lg font-bold text-brand-950">{lang === "ar" ? d.name_ar : d.name_en}</h3>
                <p className="mt-1 text-sm font-medium text-brand-600">
                  {d.type === "doctor" || d.type === "consultant"
                    ? lang === "ar"
                      ? d.specialty_ar
                      : d.specialty_en
                    : lang === "ar"
                      ? d.position
                      : d.position}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
