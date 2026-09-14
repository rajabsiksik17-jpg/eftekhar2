"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { SocialLink } from "@/lib/types";
import { socialIcon } from "@/components/icons";
import { ArrowUp, Calendar, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionsProps {
  lang: Lang;
  social: SocialLink[];
  socialEnabled: boolean;
  appointmentEnabled: boolean;
  backToTopEnabled: boolean;
  appointmentText: string;
  appointmentUrl: string;
}

export function FloatingActions(props: FloatingActionsProps) {
  const {
    lang,
    social,
    socialEnabled,
    appointmentEnabled,
    backToTopEnabled,
    appointmentText,
    appointmentUrl,
  } = props;

  const [socialOpen, setSocialOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeSocial = social.filter((s) => s.url);

  return (
    <div className="fixed bottom-5 z-40 flex flex-col items-end gap-3 end-5" dir="ltr">
      {socialOpen && (
        <div className="flex flex-col gap-2">
          {activeSocial.map((s) => {
            const Icon = socialIcon(s.platform);
            return (
              <a
                key={s.id}
                href={s.url!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-700 shadow-soft ring-1 ring-brand-950/10 transition hover:bg-brand-600 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}

      {socialEnabled && activeSocial.length > 0 && (
        <button
          type="button"
          onClick={() => setSocialOpen((v) => !v)}
          aria-label="Social media"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition",
            socialOpen ? "bg-brand-950 text-white" : "bg-brand-600 text-white hover:bg-brand-700",
          )}
        >
          {socialOpen ? <X className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
        </button>
      )}

      {appointmentEnabled && (
        <Link
          href={`/${lang}${appointmentUrl === "/" ? "" : appointmentUrl}`}
          className="btn-gold btn-md animate-pulse-soft"
        >
          <Calendar className="h-4 w-4" />
          {appointmentText}
        </Link>
      )}

      {backToTopEnabled && showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-950 text-white shadow-soft transition hover:bg-brand-800"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
