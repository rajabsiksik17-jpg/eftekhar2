import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@/components/analytics/Analytics";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#276d71",
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

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <Toaster
          position="top-center"
          dir={dir}
          toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
        />
      </body>
    </html>
  );
}
