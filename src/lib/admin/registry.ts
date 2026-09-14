import { CONTENT_TAG, SETTINGS_TAG } from "@/lib/settings";

export interface EntityConfig {
  table: string;
  permission: string; // base permission slug (e.g. "services" -> services.view / services.create ...)
  tags: string[];
  select?: string;
  order?: string;
  orderAsc?: boolean;
  writeColumns: string[];
  searchableColumns?: string[];
}

export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
  services: {
    table: "services",
    permission: "services",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "category_id", "slug", "name_ar", "name_en", "description_ar", "description_en",
      "content_ar", "content_en", "icon", "image", "is_featured", "display_order", "is_active",
      "seo_title_ar", "seo_title_en", "seo_description_ar", "seo_description_en",
      "seo_keywords_ar", "seo_keywords_en", "canonical", "og_image",
    ],
    searchableColumns: ["name_ar", "name_en", "slug"],
  },
  "service-categories": {
    table: "service_categories",
    permission: "categories",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "slug", "name_ar", "name_en", "description_ar", "description_en", "content_ar", "content_en",
      "icon", "cover_image", "background", "is_featured", "display_order", "is_active",
      "seo_title_ar", "seo_title_en", "seo_description_ar", "seo_description_en",
      "seo_keywords_ar", "seo_keywords_en", "canonical", "og_image",
    ],
    searchableColumns: ["name_ar", "name_en", "slug"],
  },
  doctors: {
    table: "doctors",
    permission: "doctors",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "slug", "name_ar", "name_en", "type", "specialty_ar", "specialty_en", "position",
      "bio_ar", "bio_en", "image", "qualifications", "experience_years", "is_active",
      "is_featured", "display_order", "seo_title_ar", "seo_title_en", "seo_description_ar",
      "seo_description_en", "seo_keywords_ar", "seo_keywords_en", "canonical", "og_image",
    ],
    searchableColumns: ["name_ar", "name_en", "slug"],
  },
  appointments: {
    table: "appointments",
    permission: "appointments",
    tags: [],
    order: "created_at",
    orderAsc: false,
    writeColumns: ["name", "phone", "email", "category_id", "service_id", "doctor_id", "preferred_date", "preferred_time", "message", "consent", "status", "notes"],
    searchableColumns: ["name", "phone", "email"],
  },
  messages: {
    table: "contact_messages",
    permission: "messages",
    tags: [],
    order: "created_at",
    orderAsc: false,
    writeColumns: ["name", "phone", "email", "subject", "message", "is_read", "is_archived"],
    searchableColumns: ["name", "email", "subject"],
  },
  gallery: {
    table: "gallery_items",
    permission: "gallery",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "type", "title_ar", "title_en", "description_ar", "description_en", "image",
      "before_image", "after_image", "category_id", "alt_text", "display_order", "is_active",
    ],
    searchableColumns: ["title_ar", "title_en"],
  },
  videos: {
    table: "videos",
    permission: "videos",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "title_ar", "title_en", "description_ar", "description_en", "youtube_url", "thumbnail",
      "category_id", "display_order", "is_active", "autoplay", "muted", "controls", "loop",
      "start_time", "end_time", "overlay", "modal",
    ],
    searchableColumns: ["title_ar", "title_en"],
  },
  testimonials: {
    table: "testimonials",
    permission: "testimonials",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "name_ar", "name_en", "rating", "review_ar", "review_en", "image", "review_date",
      "source", "google_url", "is_demo", "display_order", "is_active",
    ],
    searchableColumns: ["name_ar", "name_en"],
  },
  statistics: {
    table: "statistics",
    permission: "pages",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: ["number", "label_ar", "label_en", "icon", "prefix", "suffix", "display_order", "is_active"],
  },
  "hero-slides": {
    table: "hero_slides",
    permission: "pages",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: [
      "title_ar", "title_en", "subtitle_ar", "subtitle_en", "description_ar", "description_en",
      "bullets", "primary_button", "secondary_button", "image", "mobile_image", "video_url",
      "background_image", "background_color", "overlay", "text_align", "content_position",
      "display_order", "is_active",
    ],
  },
  pages: {
    table: "pages",
    permission: "pages",
    tags: [CONTENT_TAG],
    order: "created_at",
    orderAsc: true,
    writeColumns: [
      "slug", "type", "title_ar", "title_en", "content_ar", "content_en",
      "seo_title_ar", "seo_title_en", "seo_description_ar", "seo_description_en",
      "seo_keywords_ar", "seo_keywords_en", "canonical", "og_image", "robots", "is_active",
    ],
    searchableColumns: ["slug", "title_ar", "title_en"],
  },
  "page-sections": {
    table: "page_sections",
    permission: "pages",
    tags: [CONTENT_TAG],
    order: "display_order",
    writeColumns: ["page_id", "section_type", "title_ar", "title_en", "subtitle_ar", "subtitle_en", "content", "settings", "display_order", "is_active"],
  },
  navigation: {
    table: "navigation_items",
    permission: "settings",
    tags: [SETTINGS_TAG],
    order: "display_order",
    writeColumns: ["label_ar", "label_en", "url", "parent_id", "display_order", "is_active", "is_external", "target"],
  },
  "social-links": {
    table: "social_links",
    permission: "settings",
    tags: [SETTINGS_TAG],
    order: "display_order",
    writeColumns: ["platform", "url", "icon", "display_order", "is_active"],
  },
  media: {
    table: "media_files",
    permission: "media",
    tags: [],
    order: "created_at",
    orderAsc: false,
    writeColumns: ["filename", "bucket", "path", "url", "alt_text", "mime_type", "size_bytes", "width", "height", "category"],
    searchableColumns: ["filename", "alt_text"],
  },
  "audit-logs": {
    table: "audit_logs",
    permission: "security",
    tags: [],
    order: "created_at",
    orderAsc: false,
    writeColumns: [],
  },
  seo: {
    table: "seo_metadata",
    permission: "seo",
    tags: [SETTINGS_TAG],
    order: "route",
    writeColumns: [
      "route", "title_ar", "title_en", "description_ar", "description_en", "keywords_ar",
      "keywords_en", "canonical", "og_title", "og_description", "og_image", "twitter_title",
      "twitter_description", "twitter_image", "robots", "structured_data",
    ],
    searchableColumns: ["route"],
  },
};

export function getEntityConfig(entity: string): EntityConfig | null {
  return ENTITY_REGISTRY[entity] ?? null;
}
