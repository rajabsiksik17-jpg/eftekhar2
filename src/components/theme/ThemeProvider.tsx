"use client";

import { useEffect } from "react";
import Script from "next/script";
import type { Appearance } from "@/lib/theme";

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: [number, number, number], pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const mr = Math.round(r + (target[0] - r) * pct);
  const mg = Math.round(g + (target[1] - g) * pct);
  const mb = Math.round(b + (target[2] - b) * pct);
  return `${mr} ${mg} ${mb}`;
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

// Light shades (toward white) then base then dark shades (toward black)
const RAMP: { key: string; light?: number; dark?: number }[] = [
  { key: "50", light: 0.92 },
  { key: "100", light: 0.82 },
  { key: "200", light: 0.7 },
  { key: "300", light: 0.55 },
  { key: "400", light: 0.35 },
  { key: "500", light: 0 },
  { key: "600", dark: 0.12 },
  { key: "700", dark: 0.25 },
  { key: "800", dark: 0.4 },
  { key: "900", dark: 0.55 },
  { key: "950", dark: 0.75 },
];

function ramp(base: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of RAMP) {
    out[s.key] = s.light !== undefined ? mix(base, WHITE, s.light) : mix(base, BLACK, s.dark ?? 0);
  }
  return out;
}

function applyPalette(prefix: string, base: string, has950: boolean) {
  const colors = ramp(base);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(colors)) {
    if (k === "950" && !has950) continue;
    root.style.setProperty(`--${prefix}-${k}`, v);
  }
}

export function ThemeProvider({ appearance }: { appearance: Appearance }) {
  useEffect(() => {
    const root = document.documentElement;
    applyPalette("brand", appearance.primary, true);
    applyPalette("accent", appearance.accent, false);
    applyPalette("secondary", appearance.secondary, false);

    if (appearance.favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = appearance.favicon;
    }
    root.setAttribute("data-themed", "1");
  }, [appearance.primary, appearance.secondary, appearance.accent, appearance.favicon]);

  if (!appearance.ga4_enabled || !appearance.ga4_id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${appearance.ga4_id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${appearance.ga4_id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
