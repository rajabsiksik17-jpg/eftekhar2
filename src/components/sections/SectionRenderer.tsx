import type { Lang } from "@/lib/i18n";
import type {
  ContactSettings,
  Doctor,
  GalleryItem,
  HeroSlide,
  PageSection,
  Service,
  ServiceCategory,
  Statistic,
  Testimonial,
  Video,
} from "@/lib/types";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { StatsSection } from "@/components/sections/StatsSection";
import { IntroductionSection } from "@/components/sections/IntroductionSection";
import { VideoContentSection } from "@/components/sections/VideoContentSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedServicesSection } from "@/components/sections/FeaturedServicesSection";
import { PromoSlider } from "@/components/sections/PromoSlider";
import { DoctorsSlider } from "@/components/sections/DoctorsSlider";
import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { WayToClinic } from "@/components/sections/WayToClinic";
import { FinalCta } from "@/components/sections/FinalCta";
import { GalleryVideosSection } from "@/components/sections/GalleryVideosSection";

export interface SectionData {
  heroSlides: HeroSlide[];
  stats: Statistic[];
  categories: ServiceCategory[];
  featuredServices: Service[];
  doctors: Doctor[];
  testimonials: Testimonial[];
  beforeAfter: GalleryItem[];
  gallery: GalleryItem[];
  videos: Video[];
  contact: ContactSettings | null;
}

export function SectionRenderer({
  sections,
  data,
  lang,
}: {
  sections: PageSection[];
  data: SectionData;
  lang: Lang;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section.section_type) {
          case "hero":
            return (
              <HeroSlider
                key={section.id}
                slides={data.heroSlides}
                lang={lang}
                autoplay={(section.settings as { autoplay?: boolean })?.autoplay !== false}
                interval={Number((section.settings as { interval?: number })?.interval ?? 5500)}
              />
            );
          case "statistics":
            return (
              <StatsSection
                key={section.id}
                stats={data.stats}
                lang={lang}
                settings={(section.settings as { background_color?: string; transparent?: boolean }) ?? {}}
              />
            );
          case "introduction":
            return <IntroductionSection key={section.id} section={section} lang={lang} />;
          case "video_content":
            return <VideoContentSection key={section.id} section={section} lang={lang} />;
          case "service_categories":
            return (
              <CategoriesSection key={section.id} section={section} categories={data.categories} lang={lang} />
            );
          case "featured_services":
            return (
              <FeaturedServicesSection
                key={section.id}
                section={section}
                services={data.featuredServices}
                categories={data.categories}
                lang={lang}
              />
            );
          case "promotional_slider":
            return <PromoSlider key={section.id} categories={data.categories} lang={lang} />;
          case "doctors":
            return (
              <DoctorsSlider
                key={section.id}
                title={lang === "ar" ? section.title_ar : section.title_en}
                subtitle={lang === "ar" ? section.subtitle_ar : section.subtitle_en}
                doctors={data.doctors}
                lang={lang}
              />
            );
          case "testimonials":
            return (
              <TestimonialsSlider
                key={section.id}
                title={lang === "ar" ? section.title_ar : section.title_en}
                testimonials={data.testimonials}
                lang={lang}
              />
            );
          case "before_after":
            return (
              <BeforeAfterSection
                key={section.id}
                section={section}
                items={data.beforeAfter.map((it) => ({
                  id: it.id,
                  before_image: it.before_image,
                  after_image: it.after_image,
                  title_ar: it.title_ar,
                  title_en: it.title_en,
                }))}
                lang={lang}
              />
            );
          case "gallery":
            return (
              <GallerySection
                key={section.id}
                title={lang === "ar" ? section.title_ar : section.title_en}
                items={data.gallery}
                lang={lang}
              />
            );
          case "gallery_videos":
            return (
              <GalleryVideosSection
                key={section.id}
                title={lang === "ar" ? section.title_ar : section.title_en}
                subtitle={lang === "ar" ? section.subtitle_ar : section.subtitle_en}
                gallery={data.gallery}
                videos={data.videos}
                lang={lang}
              />
            );
          case "way_to_clinic":
            return <WayToClinic key={section.id} section={section} contact={data.contact} lang={lang} />;
          case "final_cta":
            return <FinalCta key={section.id} section={section} lang={lang} />;
          default:
            return null;
        }
      })}
    </>
  );
}
