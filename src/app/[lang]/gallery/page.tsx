import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { getGalleryItems } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GallerySection } from "@/components/sections/GallerySection";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  return buildMetadata({ lang, route: "/gallery" });
}

export default async function GalleryPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const items = await getGalleryItems("normal");

  return (
    <>
      <PageHero
        title={lang === "ar" ? "معرض الصور" : "Image Gallery"}
        subtitle={lang === "ar" ? "لقطات من عياداتنا وخدماتنا." : "Glimpses of our clinic and services."}
        breadcrumb={<Breadcrumbs items={[{ label: lang === "ar" ? "معرض الصور" : "Gallery" }]} lang={lang} />}
      />
      <GallerySection title={null} items={items} lang={lang} />
    </>
  );
}
