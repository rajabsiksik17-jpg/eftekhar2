"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { ServiceFaq } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs, lang }: { faqs: ServiceFaq[]; lang: Lang }) {
  const [open, setOpen] = useState<number | null>(0);
  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={f.id} className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-start"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-brand-950">
              {lang === "ar" ? f.question_ar : f.question_en}
            </span>
            <ChevronDown
              className={cn("h-5 w-5 shrink-0 text-brand-500 transition-transform", open === i && "rotate-180")}
            />
          </button>
          {open === i && (
            <div className="border-t border-brand-950/10 px-5 py-4 text-sm leading-relaxed text-brand-700/90">
              {lang === "ar" ? f.answer_ar : f.answer_en}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
