"use client";

import { useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { COUNTRIES, DEFAULT_COUNTRY, getCountry, normalizeNational } from "@/lib/phone";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhoneValue {
  country_code: string;
  dial_code: string;
  national_number: string;
  international_number: string;
}

export function PhoneInput({
  lang,
  defaultCountry,
  value,
  onChange,
  required,
}: {
  lang: Lang;
  defaultCountry?: string;
  value?: PhoneValue;
  onChange: (v: PhoneValue) => void;
  required?: boolean;
}) {
  const initial = getCountry(defaultCountry ?? DEFAULT_COUNTRY.code);
  const [country, setCountry] = useState(initial);
  const [national, setNational] = useState(value?.national_number ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.name_ar.includes(query) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const emit = (c: typeof country, nat: string) => {
    const normalized = normalizeNational(nat);
    const international = `${c.dial}${normalized}`;
    onChange({
      country_code: c.code,
      dial_code: c.dial,
      national_number: normalized,
      international_number: international,
    });
  };

  const selectCountry = (c: typeof country) => {
    setCountry(c);
    setOpen(false);
    emit(c, national);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="relative" dir="ltr">
      <div className="flex">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-s-xl border border-brand-950/15 bg-white px-3 text-sm text-brand-950 focus:outline-none"
          aria-label="Select country"
        >
          <span className="text-lg">{country.flag}</span>
          <span className="font-medium">{country.dial}</span>
          <ChevronDown className="h-4 w-4 text-brand-400" />
        </button>
        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={national}
          onChange={(e) => {
            setNational(e.target.value);
            emit(country, e.target.value);
          }}
          placeholder={lang === "ar" ? "رقم الهاتف" : "Phone number"}
          className="input rounded-s-none border-s-0 rounded-e-xl"
          dir="ltr"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-brand-950/10 bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-brand-950/10 p-3">
            <Search className="h-4 w-4 text-brand-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن دولة..." : "Search country..."}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1">
            {filtered.map((c) => (
              <li key={c.code + c.dial}>
                <button
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-brand-50",
                    c.code === country.code && "bg-brand-50",
                  )}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 text-start">{lang === "ar" ? c.name_ar : c.name}</span>
                  <span className="text-ink-muted" dir="ltr">{c.dial}</span>
                  {c.code === country.code && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
