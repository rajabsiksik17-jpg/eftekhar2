"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { GalleryItem } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function GallerySection({
  title,
  items,
  lang,
}: {
  title?: string | null;
  items: GalleryItem[];
  lang: Lang;
}) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active === null) return;
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, items.length]);

  if (items.length === 0) return null;

  const current = active !== null ? items[active] : null;

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setActive(i)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image ?? it.after_image ?? ""}
                alt={it.alt_text ?? (lang === "ar" ? it.title_ar ?? "" : it.title_en ?? "")}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {(it.title_ar || it.title_en) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/80 to-transparent p-3 text-start text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {lang === "ar" ? it.title_ar : it.title_en}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute top-5 end-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((active! - 1 + items.length) % items.length);
                }}
                aria-label="Previous"
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((active! + 1) % items.length);
                }}
                aria-label="Next"
                className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image ?? current.after_image ?? ""}
              alt={current.alt_text ?? ""}
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
