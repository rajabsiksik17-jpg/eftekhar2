"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { Statistic } from "@/lib/types";
import { Icon } from "@/components/icons";

function CountUp({ value, start }: { value: number; start: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!start) return;
    const duration = 1600;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);
  return <>{display.toLocaleString()}</>;
}

export function StatsSection({
  stats,
  lang,
  settings,
}: {
  stats: Statistic[];
  lang: Lang;
  settings?: { background_color?: string; transparent?: boolean };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStart(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (stats.length === 0) return null;

  const bg = settings?.background_color ?? "#172554";
  const transparent = Boolean(settings?.transparent);

  return (
    <section className="py-14" style={transparent ? undefined : { backgroundColor: bg }}>
      <div ref={ref} className="container-px grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.id} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold-400">
              <Icon name={s.icon} className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-white sm:text-4xl" dir="ltr">
              {s.prefix}
              <CountUp value={s.number} start={start} />
              {s.suffix}
            </div>
            <div className="mt-1 text-sm text-brand-100/70">
              {lang === "ar" ? s.label_ar : s.label_en}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
