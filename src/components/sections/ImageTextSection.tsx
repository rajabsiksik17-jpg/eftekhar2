import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection } from "@/lib/types";
import { ImageIcon } from "lucide-react";

interface Button {
  label_ar?: string;
  label_en?: string;
  url?: string;
  type?: string;
}
interface Content {
  image?: string;
  ar?: { text?: string };
  en?: { text?: string };
  buttons?: Button[];
}

export function ImageTextSection({ section, lang }: { section: PageSection; lang: Lang }) {
  const content = (section.content ?? {}) as Content;
  const settings = (section.settings ?? {}) as { layout?: string };
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const text = lang === "ar" ? content.ar?.text : content.en?.text;
  const image = content.image;
  const buttons = content.buttons ?? [];
  const reverse = settings.layout === "image_right";

  const href = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  const media = image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={title ?? ""} className="w-full rounded-3xl object-cover shadow-soft ring-1 ring-brand-950/5" loading="lazy" />
  ) : (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-brand-300 bg-brand-50 text-brand-400">
      <ImageIcon className="h-12 w-12" />
      <p className="text-sm font-medium">{lang === "ar" ? "لا توجد صورة حالياً" : "No image available yet"}</p>
    </div>
  );

  const textBlock = (
    <div>
      {title && <h2 className="section-title">{title}</h2>}
      {text && <p className="mt-4 leading-relaxed text-ink-secondary">{text}</p>}
      {buttons.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {buttons.map((b, i) => (
            <Link
              key={i}
              href={href(b.url)}
              className={b.type === "outline" ? "btn-outline btn-md" : "btn-primary btn-md"}
            >
              {lang === "ar" ? b.label_ar : b.label_en}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className={reverse ? "py-16" : "bg-white py-16"}>
      <div className="container-px grid items-center gap-10 lg:grid-cols-2">
        {reverse ? (
          <>
            {textBlock}
            {media}
          </>
        ) : (
          <>
            {media}
            {textBlock}
          </>
        )}
      </div>
    </section>
  );
}
