import type { Lang } from "@/lib/i18n";
import type { ServiceCategory } from "@/lib/types";
import { Icon } from "@/components/icons";

export function PromoSlider({ categories, lang }: { categories: ServiceCategory[]; lang: Lang }) {
  if (categories.length === 0) return null;
  const items = [...categories, ...categories];
  return (
    <section className="overflow-hidden bg-gold-500 py-6" dir="ltr">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-10">
        {items.map((c, i) => (
          <div key={`${c.id}-${i}`} className="flex items-center gap-3 text-white">
            <Icon name={c.icon} className="h-6 w-6" />
            <span className="whitespace-nowrap text-lg font-bold" dir={lang === "ar" ? "rtl" : "ltr"}>
              {lang === "ar" ? c.name_ar : c.name_en}
            </span>
            <span className="mx-4 h-1.5 w-1.5 rounded-full bg-white/60" />
          </div>
        ))}
      </div>
    </section>
  );
}
