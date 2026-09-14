"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Quote, Star } from "lucide-react";
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
  if (testimonials.length === 0) return null;
  const t = testimonials[Math.min(index, testimonials.length - 1)];
  const name = lang === "ar" ? t.name_ar : t.name_en;
  const review = lang === "ar" ? t.review_ar : t.review_en;

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <SectionHeading title={title} />
        <div className="relative mx-auto max-w-3xl">
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
            <p className="text-lg leading-relaxed text-brand-800">“{review}”</p>
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
                <div className="font-semibold text-brand-950">{name}</div>
                {t.source === "google" && (
                  <div className="text-xs text-brand-500">
                    Google{t.is_demo ? ` · ${lang === "ar" ? "مراجعة تجريبية" : "Demo review"}` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>

          {testimonials.length > 1 && (
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
          )}
        </div>
      </div>
    </section>
  );
}
