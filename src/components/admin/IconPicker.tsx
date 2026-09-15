"use client";

import { useMemo, useState } from "react";
import { ICON_NAMES, Icon, getIcon } from "@/components/icons";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_NAMES;
    return ICON_NAMES.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  const Current = getIcon(value);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-brand-950/15 bg-white px-4 py-2.5 text-sm hover:border-brand-500"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Current className="h-4 w-4" />
        </span>
        <span className="flex-1 text-start text-ink-secondary" dir="ltr">{value || "—"}</span>
        <span className="text-xs text-ink-muted">اختيار</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-5" dir="rtl">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن أيقونة..."
                  className="input ps-9"
                />
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-ink-muted hover:bg-brand-50" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
              {filtered.map((name) => {
                const C = getIcon(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition hover:border-brand-500 hover:bg-brand-50",
                      value === name ? "border-brand-500 bg-brand-50" : "border-brand-950/10",
                    )}
                    title={name}
                  >
                    <C className="h-5 w-5 text-brand-700" />
                    <span className="w-full truncate text-[10px] text-ink-muted" dir="ltr">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
