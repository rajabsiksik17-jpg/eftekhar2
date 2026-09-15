"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { Search, X } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: string;
  typeLabel: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}

export function SearchDialog({ open, onClose, lang }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open, lang]);

  if (!open) return null;

  return (
    <div className="modal-backdrop z-[110]" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-brand-950/10 pb-3">
          <Search className="h-5 w-5 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن خدمة، طبيب، فيديو..." : "Search services, doctors, videos..."}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 max-h-80 overflow-y-auto">
          {loading && (
            <p className="py-6 text-center text-sm text-ink-muted">
              {lang === "ar" ? "جارٍ البحث..." : "Searching..."}
            </p>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-muted">
              {lang === "ar" ? "لا توجد نتائج" : "No results found"}
            </p>
          )}
          {results.map((r) => (
            <Link
              key={`${r.type}-${r.id}`}
              href={r.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-brand-50"
            >
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {r.typeLabel}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-brand-950">{r.title}</div>
                {r.subtitle && <div className="truncate text-xs text-ink-muted">{r.subtitle}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
