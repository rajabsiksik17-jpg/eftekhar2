import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import { getAppearance } from "@/lib/theme";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LangDirection } from "@/components/theme/LangDirection";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://eftekar-services.com"),
  title: {
    default: "عيادات افتخار للخدمات العلاجية",
    template: "%s | عيادات افتخار",
  },
  description: "خدمات طبية وتجميلية متخصصة بإشراف أطباء مختصين في عمّان.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const lang = headersList.get("x-lang") === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  const appearance = await getAppearance();

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ThemeProvider appearance={appearance} />
        <LangDirection />
        <Toaster
          position="top-center"
          dir={dir}
          toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
        />
      </body>
    </html>
  );
}
