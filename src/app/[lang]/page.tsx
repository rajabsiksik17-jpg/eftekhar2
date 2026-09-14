import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import {
  getCategories,
  getDoctors,
  getFeaturedServices,
  getGalleryItems,
  getHeroSlides,
  getPageBySlug,
  getPageSections,
  getStatistics,
  getTestimonials,
} from "@/lib/data";
import { getContactSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildMetadata({ lang: lang as Lang, route: "/" });
}

export default async function HomePage({ params }: Props) {
  const { lang: langParam } = await params;
  const lang = langParam as Lang;

  const page = await getPageBySlug("home");
  if (!page) notFound();

  const [sections, heroSlides, stats, categories, featuredServices, doctors, testimonials, gallery, contact] =
    await Promise.all([
      getPageSections(page.id),
      getHeroSlides(),
      getStatistics(),
      getCategories(),
      getFeaturedServices(),
      getDoctors("doctor"),
      getTestimonials(),
      getGalleryItems("normal"),
      getContactSettings(),
    ]);

  const beforeAfter = await getGalleryItems("before_after");

  return (
    <SectionRenderer
      sections={sections}
      lang={lang}
      data={{
        heroSlides,
        stats,
        categories,
        featuredServices,
        doctors,
        testimonials,
        beforeAfter,
        gallery,
        contact,
      }}
    />
  );
}
