import type { SupabaseClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface BaseRow {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface Role extends BaseRow {
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
}

export interface Permission extends BaseRow {
  name: string;
  slug: string;
  group: string | null;
  description: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog extends BaseRow {
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Json | null;
  ip: string | null;
  user_agent: string | null;
}

export interface Page extends BaseRow {
  slug: string;
  type: string;
  title_ar: string | null;
  title_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords_ar: string | null;
  seo_keywords_en: string | null;
  canonical: string | null;
  og_title_ar: string | null;
  og_title_en: string | null;
  og_description_ar: string | null;
  og_description_en: string | null;
  og_image: string | null;
  robots: string | null;
  is_active: boolean;
}

export interface PageSection extends BaseRow {
  page_id: string;
  section_type: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  content: Json;
  settings: Json;
  display_order: number;
  is_active: boolean;
}

export interface ServiceCategory extends BaseRow {
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  icon: string | null;
  cover_image: string | null;
  background: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords_ar: string | null;
  seo_keywords_en: string | null;
  canonical: string | null;
  og_image: string | null;
}

export interface Service extends BaseRow {
  category_id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  icon: string | null;
  image: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords_ar: string | null;
  seo_keywords_en: string | null;
  canonical: string | null;
  og_image: string | null;
}

export interface ServiceContentBlock extends BaseRow {
  service_id: string;
  block_type: string;
  title_ar: string | null;
  title_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  media: Json;
  display_order: number;
  is_active: boolean;
}

export interface ServiceFaq extends BaseRow {
  service_id: string | null;
  category_id: string | null;
  question_ar: string;
  question_en: string;
  answer_ar: string | null;
  answer_en: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Doctor extends BaseRow {
  slug: string | null;
  name_ar: string;
  name_en: string;
  type: string;
  specialty_ar: string | null;
  specialty_en: string | null;
  position: string | null;
  bio_ar: string | null;
  bio_en: string | null;
  image: string | null;
  qualifications: string | null;
  experience_years: number | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords_ar: string | null;
  seo_keywords_en: string | null;
  canonical: string | null;
  og_image: string | null;
}

export interface Appointment extends BaseRow {
  name: string;
  phone: string;
  email: string | null;
  country: string | null;
  country_code: string | null;
  dial_code: string | null;
  national_number: string | null;
  international_number: string | null;
  category_id: string | null;
  service_id: string | null;
  doctor_id: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  consent: boolean;
  status: string;
  notes: string | null;
}

export interface ContactMessage extends BaseRow {
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
}

export interface GalleryCategory extends BaseRow {
  slug: string;
  name_ar: string;
  name_en: string;
  display_order: number;
  is_active: boolean;
}

export interface GalleryItem extends BaseRow {
  type: "normal" | "before_after";
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  image: string | null;
  before_image: string | null;
  after_image: string | null;
  category_id: string | null;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
}

export interface VideoCategory extends BaseRow {
  slug: string;
  name_ar: string;
  name_en: string;
  display_order: number;
  is_active: boolean;
}

export interface Video extends BaseRow {
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  youtube_url: string;
  thumbnail: string | null;
  category_id: string | null;
  display_order: number;
  is_active: boolean;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  loop: boolean;
  start_time: number | null;
  end_time: number | null;
  overlay: boolean;
  modal: boolean;
}

export interface Testimonial extends BaseRow {
  name_ar: string | null;
  name_en: string | null;
  rating: number;
  review_ar: string | null;
  review_en: string | null;
  image: string | null;
  review_date: string | null;
  source: "google" | "manual" | "website";
  google_url: string | null;
  is_demo: boolean;
  display_order: number;
  is_active: boolean;
}

export interface Statistic extends BaseRow {
  number: number;
  label_ar: string;
  label_en: string;
  icon: string | null;
  prefix: string | null;
  suffix: string | null;
  display_order: number;
  is_active: boolean;
}

export interface HeroSlide extends BaseRow {
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  bullets: Json;
  primary_button: Json | null;
  secondary_button: Json | null;
  image: string | null;
  mobile_image: string | null;
  video_url: string | null;
  background_image: string | null;
  background_color: string | null;
  overlay: number;
  text_align: string;
  content_position: string;
  display_order: number;
  is_active: boolean;
}

export interface SocialLink extends BaseRow {
  platform: string;
  url: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export interface NavigationItem extends BaseRow {
  label_ar: string;
  label_en: string;
  url: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  is_external: boolean;
  target: string | null;
}

export interface ContactSettings {
  id: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address_ar: string | null;
  address_en: string | null;
  google_maps_url: string | null;
  working_hours: Json;
  emergency_phone: string | null;
  secondary_phone: string | null;
  updated_at: string;
}

export interface FooterSettings {
  id: number;
  about_ar: string | null;
  about_en: string | null;
  copyright_ar: string | null;
  copyright_en: string | null;
  columns: Json;
  updated_at: string;
}

export interface SeoMetadata extends BaseRow {
  route: string;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  keywords_ar: string | null;
  keywords_en: string | null;
  canonical: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  robots: string | null;
  structured_data: Json | null;
}

export interface MediaFile extends BaseRow {
  filename: string;
  bucket: string;
  path: string;
  url: string | null;
  alt_text: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  category: string | null;
  created_by: string | null;
}

export interface EmailSettings {
  id: number;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password_enc: string | null;
  smtp_encryption: string | null;
  smtp_from: string | null;
  imap_host: string | null;
  imap_port: number | null;
  imap_username: string | null;
  imap_password_enc: string | null;
  imap_encryption: string | null;
  updated_at: string;
}

export type DbClient = SupabaseClient;
