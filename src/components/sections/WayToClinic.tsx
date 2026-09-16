import type { Lang } from "@/lib/i18n";
import type { PageSection, ContactSettings } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { MapPin, Phone, Mail, Clock, Navigation, Video } from "lucide-react";

interface Content {
  ar?: { text?: string };
  en?: { text?: string };
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
  const videoUrl = content.video?.youtube_url ?? "";
  const workingHours = (Array.isArray(contact?.working_hours) ? contact.working_hours : []) as Record<string, string>[];

  return (
    <section className="py-20">
      <div className="container-px">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            {videoUrl ? (
              <VideoPlayer config={{ url: videoUrl }} className="shadow-soft ring-1 ring-brand-950/5" />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 text-brand-400">
                <Video className="h-12 w-12" />
                <p className="text-sm font-medium">{lang === "ar" ? "لا يوجد فيديو حالياً" : "No video available yet"}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 p-6 sm:p-8">
            {localized?.text && <p className="leading-relaxed text-ink-secondary">{localized.text}</p>}

            <div className="mt-6 space-y-3">
              {contact?.phone && (
                <InfoRow icon={<Phone className="h-5 w-5" />} href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  <span className="phone-ltr font-semibold text-ink">{contact.phone}</span>
                </InfoRow>
              )}
              {contact?.email && (
                <InfoRow icon={<Mail className="h-5 w-5" />} href={`mailto:${contact.email}`}>
                  <span className="text-ink">{contact.email}</span>
                </InfoRow>
              )}
              {(contact?.address_ar || contact?.address_en) && (
                <InfoRow icon={<MapPin className="h-5 w-5" />}>
                  <span className="text-ink">{lang === "ar" ? contact.address_ar : contact.address_en}</span>
                </InfoRow>
              )}
              {workingHours.length > 0 && (
                <InfoRow icon={<Clock className="h-5 w-5" />}>
                  <span className="text-ink">
                    {workingHours.map((w, i) => (
                      <span key={i} className="block">
                        {lang === "ar" ? w.days_ar : w.days_en}: {lang === "ar" ? w.hours_ar : w.hours_en}
                      </span>
                    ))}
                  </span>
                </InfoRow>
              )}
            </div>

            {contact?.google_maps_url && (
              <a href={contact.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-md mt-6">
                <Navigation className="h-4 w-4" />
                {lang === "ar" ? "فتح الموقع على الخريطة" : "Open location on map"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, children, href }: { icon: React.ReactNode; children: React.ReactNode; href?: string }) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">{icon}</span>
      <span className="text-sm">{children}</span>
    </>
  );
  return href ? (
    <a href={href} className="flex items-center gap-3">{content}</a>
  ) : (
    <div className="flex items-start gap-3">{content}</div>
  );
}
