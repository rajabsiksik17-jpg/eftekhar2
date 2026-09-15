import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { PageSection, ContactSettings } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { MapPin, Phone, Mail } from "lucide-react";

interface Btn {
  label?: string;
  url?: string;
  icon?: string;
}
interface Content {
  ar?: { text?: string; buttons?: Btn[] };
  en?: { text?: string; buttons?: Btn[] };
  video?: { youtube_url?: string; thumbnail?: string };
}

export function WayToClinic({
  section,
  contact,
  lang,
}: {
  section: PageSection;
  contact: ContactSettings | null;
  lang: Lang;
}) {
  const content = (section.content ?? {}) as Content;
  const title = lang === "ar" ? section.title_ar : section.title_en;
  const subtitle = lang === "ar" ? section.subtitle_ar : section.subtitle_en;
  const localized = lang === "ar" ? content.ar : content.en;
  const buttons = localized?.buttons ?? [];
  const video = content.video ?? {};

  const href = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `/${lang}${url === "/" ? "" : url}`;
  };

  return (
    <section className="bg-brand-50/50 py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <YouTubeEmbed url={video.youtube_url ?? ""} title={title ?? undefined} className="shadow-soft" />
          <div>
            {localized?.text && <p className="leading-relaxed text-brand-800/90">{localized.text}</p>}
            <div className="mt-6 space-y-3 text-sm text-brand-800">
              {contact?.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brand-600" /> <span className="phone-ltr">{contact.phone}</span>
                </a>
              )}
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brand-600" /> {contact.email}
                </a>
              )}
              {(contact?.address_ar || contact?.address_en) && (
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {lang === "ar" ? contact.address_ar : contact.address_en}
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {contact?.google_maps_url && (
                <a href={contact.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-md">
                  <MapPin className="h-4 w-4" />
                  {lang === "ar" ? "فتح الموقع على الخريطة" : "Open location on map"}
                </a>
              )}
              {buttons.map((b, i) => (
                <Link key={i} href={href(b.url)} className="btn-primary btn-md">
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
