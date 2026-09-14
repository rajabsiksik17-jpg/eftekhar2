import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({ lang: lang as Lang, route: "/privacy-policy" });
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LegalPage lang={lang as Lang} slug="privacy-policy" />;
}
