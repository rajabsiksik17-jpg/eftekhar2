"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Keeps <html lang> and <html dir> in sync on every navigation.
 * The root layout sets these server-side, but client-side navigation
 * (language switcher) does not re-render the root layout, so we update
 * the document attributes here based on the current path.
 */
export function LangDirection() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const lang = pathname.startsWith("/en") ? "en" : "ar";
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.style.direction = dir;
  }, [pathname]);

  return null;
}
