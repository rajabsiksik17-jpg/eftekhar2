import { unstable_cache } from "next/cache";
import { createServerClientBound } from "@/lib/supabase/client";
import type {
  Doctor,
  GalleryCategory,
  GalleryItem,
  HeroSlide,
  Page,
  PageSection,
  Service,
  ServiceCategory,
  ServiceContentBlock,
  ServiceFaq,
  Statistic,
  Testimonial,
  Video,
  VideoCategory,
} from "@/lib/types";
import { CONTENT_TAG } from "@/lib/settings";

const opts: { revalidate: number; tags: string[] } = { revalidate: 300, tags: [CONTENT_TAG] };

export const getCategories = unstable_cache(
  async (): Promise<ServiceCategory[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["categories"],
  opts,
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<ServiceCategory | null> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("service_categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
  ["category-by-slug"],
  opts,
);

export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["services"],
  opts,
);

export const getServicesByCategory = unstable_cache(
  async (categoryId: string): Promise<Service[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["services-by-category"],
  opts,
);

export const getFeaturedServices = unstable_cache(
  async (): Promise<Service[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order")
      .limit(20);
    return data ?? [];
  },
  ["featured-services"],
  opts,
);

export const getServiceBySlug = unstable_cache(
  async (slug: string): Promise<Service | null> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
  ["service-by-slug"],
  opts,
);

export const getServiceBlocks = unstable_cache(
  async (serviceId: string): Promise<ServiceContentBlock[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("service_content_blocks")
      .select("*")
      .eq("service_id", serviceId)
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["service-blocks"],
  opts,
);

export const getFaqs = unstable_cache(
  async (optsArgs: { serviceId?: string; categoryId?: string }): Promise<ServiceFaq[]> => {
    const supabase = await createServerClientBound();
    let q = supabase
      .from("service_faqs")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (optsArgs.serviceId) q = q.eq("service_id", optsArgs.serviceId);
    if (optsArgs.categoryId) q = q.eq("category_id", optsArgs.categoryId);
    const { data } = await q;
    return data ?? [];
  },
  ["faqs"],
  opts,
);

export const getDoctors = unstable_cache(
  async (type?: string): Promise<Doctor[]> => {
    const supabase = await createServerClientBound();
    let q = supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (type) q = q.eq("type", type);
    const { data } = await q;
    return data ?? [];
  },
  ["doctors"],
  opts,
);

export const getDoctorBySlug = unstable_cache(
  async (slug: string): Promise<Doctor | null> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
  ["doctor-by-slug"],
  opts,
);

export const getGalleryItems = unstable_cache(
  async (type?: "normal" | "before_after"): Promise<GalleryItem[]> => {
    const supabase = await createServerClientBound();
    let q = supabase
      .from("gallery_items")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (type) q = q.eq("type", type);
    const { data } = await q;
    return data ?? [];
  },
  ["gallery-items"],
  opts,
);

export const getGalleryCategories = unstable_cache(
  async (): Promise<GalleryCategory[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("gallery_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["gallery-categories"],
  opts,
);

export const getVideos = unstable_cache(
  async (): Promise<Video[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["videos"],
  opts,
);

export const getVideoCategories = unstable_cache(
  async (): Promise<VideoCategory[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("video_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["video-categories"],
  opts,
);

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["testimonials"],
  opts,
);

export const getStatistics = unstable_cache(
  async (): Promise<Statistic[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("statistics")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["statistics"],
  opts,
);

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlide[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["hero-slides"],
  opts,
);

export const getPageBySlug = unstable_cache(
  async (slug: string): Promise<Page | null> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
  ["page-by-slug"],
  opts,
);

export const getPageSections = unstable_cache(
  async (pageId: string): Promise<PageSection[]> => {
    const supabase = await createServerClientBound();
    const { data } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", pageId)
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["page-sections"],
  opts,
);
