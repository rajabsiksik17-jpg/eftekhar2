import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";
import { getCategories, getServices } from "@/lib/data";
import {
  getSiteSettings,
  getContactSettings,
  getFooterSettings,
  getSocialLinks,
  getNavigationItems,
} from "@/lib/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";

export const dynamic = "force-dynamic";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as "ar" | "en";

  const [settings, contact, footer, social, nav, categories, services] = await Promise.all([
    getSiteSettings(),
    getContactSettings(),
    getFooterSettings(),
    getSocialLinks(),
    getNavigationItems(),
    getCategories(),
    getServices(),
  ]);

  const siteName = lang === "ar" ? settings.site_name_ar : settings.site_name_en;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lang={lang}
        siteName={siteName}
        logoUrl={settings.logo_url || null}
        nav={nav}
        ctaText={lang === "ar" ? settings.header.cta_text_ar : settings.header.cta_text_en}
        ctaUrl={settings.header.cta_url}
        showPhone={settings.header.show_phone}
        phone={contact?.phone ?? null}
        showLangSwitcher={settings.header.show_lang_switcher}
        autoServicesDropdown={settings.header.auto_services_dropdown}
        categories={categories.map((c) => ({ slug: c.slug, name_ar: c.name_ar, name_en: c.name_en }))}
      />

      <main className="flex-1">{children}</main>

      <Footer
        lang={lang}
        siteName={siteName}
        logoUrl={settings.logo_url || null}
        nav={nav}
        contact={contact}
        footer={footer}
        social={social}
        categories={categories}
        services={services}
        ctaText={lang === "ar" ? settings.header.cta_text_ar : settings.header.cta_text_en}
        ctaUrl={settings.header.cta_url}
      />

      <FloatingActions
        lang={lang}
        social={social}
        socialEnabled={settings.floating.social_enabled}
        appointmentEnabled={settings.floating.appointment_enabled}
        backToTopEnabled={settings.floating.back_to_top_enabled}
        appointmentText={
          lang === "ar" ? settings.floating.appointment_text_ar : settings.floating.appointment_text_en
        }
        appointmentUrl={settings.header.cta_url}
      />
    </div>
  );
}
