-- ============================================================
-- Eftekar Medical & Therapeutic Clinics
-- Database schema (PostgreSQL / Supabase)
-- Migration 00001_init
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Helper: auto-update updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- AUTH / RBAC
-- ------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "group" text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_super_admin boolean not null default false,
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- ------------------------------------------------------------
-- SESSIONS / OTP / AUDIT
-- ------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ip text,
  user_agent text,
  device text,
  browser text,
  os text,
  otp_verified boolean not null default false,
  login_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PAGES / PAGE BUILDER
-- ------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type text not null default 'custom', -- home | about | contact | legal | custom
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  -- SEO
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords_ar text,
  seo_keywords_en text,
  canonical text,
  og_title_ar text,
  og_title_en text,
  og_description_ar text,
  og_description_en text,
  og_image text,
  robots text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_type text not null,
  title_ar text,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.page_sections(id) on delete cascade,
  item_type text not null default 'text',
  title_ar text,
  title_en text,
  content jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  content_ar text,
  content_en text,
  icon text,
  cover_image text,
  background text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  -- SEO
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords_ar text,
  seo_keywords_en text,
  canonical text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  content_ar text,
  content_en text,
  icon text,
  image text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  -- SEO
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords_ar text,
  seo_keywords_en text,
  canonical text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_content_blocks (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  block_type text not null default 'rich_text',
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  media jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  category_id uuid references public.service_categories(id) on delete cascade,
  question_ar text not null,
  question_en text not null,
  answer_ar text,
  answer_en text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DOCTORS / STAFF
-- ------------------------------------------------------------
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name_ar text not null,
  name_en text not null,
  type text not null default 'doctor', -- doctor | consultant | staff | management | other
  specialty_ar text,
  specialty_en text,
  position text,
  bio_ar text,
  bio_en text,
  image text,
  qualifications text,
  experience_years int,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  display_order int not null default 0,
  -- SEO
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords_ar text,
  seo_keywords_en text,
  canonical text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctors_type_check check (type in ('doctor','consultant','staff','management','other'))
);

create table if not exists public.doctor_specialties (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  display_order int not null default 0
);

create table if not exists public.doctor_services (
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (doctor_id, service_id)
);

create table if not exists public.doctor_categories (
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  primary key (doctor_id, category_id)
);

-- ------------------------------------------------------------
-- APPOINTMENTS / CONTACT
-- ------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  country text,
  country_code text,
  dial_code text,
  national_number text,
  international_number text,
  category_id uuid references public.service_categories(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  doctor_id uuid references public.doctors(id) on delete set null,
  preferred_date date,
  preferred_time text,
  message text,
  consent boolean not null default false,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_status_check check (status in ('new','pending','confirmed','completed','cancelled','no_show'))
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- GALLERY / VIDEOS
-- ------------------------------------------------------------
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'normal', -- normal | before_after
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  image text,
  before_image text,
  after_image text,
  category_id uuid references public.gallery_categories(id) on delete set null,
  alt_text text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_type_check check (type in ('normal','before_after'))
);

create table if not exists public.video_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  youtube_url text not null,
  thumbnail text,
  category_id uuid references public.video_categories(id) on delete set null,
  display_order int not null default 0,
  is_active boolean not null default true,
  autoplay boolean not null default false,
  muted boolean not null default false,
  controls boolean not null default true,
  loop boolean not null default false,
  start_time int,
  end_time int,
  overlay boolean not null default false,
  modal boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TESTIMONIALS / STATISTICS
-- ------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name_ar text,
  name_en text,
  rating int not null default 5,
  review_ar text,
  review_en text,
  image text,
  review_date date,
  source text not null default 'manual', -- google | manual | website
  google_url text,
  is_demo boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint testimonials_source_check check (source in ('google','manual','website')),
  constraint testimonials_rating_check check (rating between 1 and 5)
);

create table if not exists public.statistics (
  id uuid primary key default gen_random_uuid(),
  number numeric not null default 0,
  label_ar text not null,
  label_en text not null,
  icon text,
  prefix text,
  suffix text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- HERO SLIDES
-- ------------------------------------------------------------
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title_ar text,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  description_ar text,
  description_en text,
  bullets jsonb not null default '[]'::jsonb,
  primary_button jsonb,
  secondary_button jsonb,
  image text,
  mobile_image text,
  video_url text,
  background_image text,
  background_color text,
  overlay numeric not null default 0.4,
  text_align text not null default 'right',
  content_position text not null default 'center',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SETTINGS
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_settings (
  id int primary key default 1,
  phone text,
  whatsapp text,
  email text,
  address_ar text,
  address_en text,
  google_maps_url text,
  working_hours jsonb not null default '[]'::jsonb,
  emergency_phone text,
  secondary_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_settings_singleton check (id = 1)
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text,
  icon text,
  display_order int not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label_ar text not null,
  label_en text not null,
  url text not null,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  display_order int not null default 0,
  is_active boolean not null default true,
  is_external boolean not null default false,
  target text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.footer_settings (
  id int primary key default 1,
  about_ar text,
  about_en text,
  copyright_ar text,
  copyright_en text,
  columns jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint footer_settings_singleton check (id = 1)
);

-- ------------------------------------------------------------
-- SEO / MEDIA / INTEGRATIONS
-- ------------------------------------------------------------
create table if not exists public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  route text not null unique,
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  keywords_ar text,
  keywords_en text,
  canonical text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  robots text,
  structured_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  bucket text not null default 'media',
  path text not null,
  url text,
  alt_text text,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  category text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.email_settings (
  id int primary key default 1,
  smtp_host text,
  smtp_port int,
  smtp_username text,
  smtp_password_enc text,
  smtp_encryption text,
  smtp_from text,
  imap_host text,
  imap_port int,
  imap_username text,
  imap_password_enc text,
  imap_encryption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_settings_singleton check (id = 1)
);

create table if not exists public.analytics_integrations (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'ga4',
  enabled boolean not null default false,
  measurement_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_console_integrations (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default false,
  site_url text,
  client_email text,
  private_key_enc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title_ar text,
  title_en text,
  message_ar text,
  message_en text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public'
      and table_name not in ('roles','permissions','role_permissions','user_roles','doctor_services','doctor_categories','sessions','otp_codes','audit_logs')
      and exists (select 1 from information_schema.columns c where c.table_schema='public' and c.table_name = table_name and c.column_name='updated_at')
  loop
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format('create trigger trg_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
create index if not exists idx_services_category on public.services(category_id);
create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_categories_slug on public.service_categories(slug);
create index if not exists idx_doctors_type on public.doctors(type);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_appointments_created on public.appointments(created_at desc);
create index if not exists idx_contact_created on public.contact_messages(created_at desc);
create index if not exists idx_gallery_type on public.gallery_items(type);
create index if not exists idx_videos_active on public.videos(is_active);
create index if not exists idx_page_sections_page on public.page_sections(page_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.sessions enable row level security;
alter table public.otp_codes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_section_items enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_content_blocks enable row level security;
alter table public.service_faqs enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_specialties enable row level security;
alter table public.doctor_services enable row level security;
alter table public.doctor_categories enable row level security;
alter table public.appointments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_items enable row level security;
alter table public.video_categories enable row level security;
alter table public.videos enable row level security;
alter table public.testimonials enable row level security;
alter table public.statistics enable row level security;
alter table public.hero_slides enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.navigation_items enable row level security;
alter table public.footer_settings enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.media_files enable row level security;
alter table public.email_settings enable row level security;
alter table public.analytics_integrations enable row level security;
alter table public.search_console_integrations enable row level security;
alter table public.notifications enable row level security;

-- ---- PUBLIC READ TABLES (anon can SELECT) ----
create policy "public select pages" on public.pages for select using (is_active = true);
create policy "public select page_sections" on public.page_sections for select using (is_active = true);
create policy "public select page_section_items" on public.page_section_items for select using (is_active = true);
create policy "public select service_categories" on public.service_categories for select using (is_active = true);
create policy "public select services" on public.services for select using (is_active = true);
create policy "public select service_content_blocks" on public.service_content_blocks for select using (is_active = true);
create policy "public select service_faqs" on public.service_faqs for select using (is_active = true);
create policy "public select doctors" on public.doctors for select using (is_active = true);
create policy "public select doctor_specialties" on public.doctor_specialties for select using (true);
create policy "public select doctor_services" on public.doctor_services for select using (true);
create policy "public select doctor_categories" on public.doctor_categories for select using (true);
create policy "public select gallery_categories" on public.gallery_categories for select using (is_active = true);
create policy "public select gallery_items" on public.gallery_items for select using (is_active = true);
create policy "public select video_categories" on public.video_categories for select using (is_active = true);
create policy "public select videos" on public.videos for select using (is_active = true);
create policy "public select testimonials" on public.testimonials for select using (is_active = true);
create policy "public select statistics" on public.statistics for select using (is_active = true);
create policy "public select hero_slides" on public.hero_slides for select using (is_active = true);
create policy "public select social_links" on public.social_links for select using (is_active = true);
create policy "public select navigation_items" on public.navigation_items for select using (is_active = true);
create policy "public select contact_settings" on public.contact_settings for select using (true);
create policy "public select footer_settings" on public.footer_settings for select using (true);
create policy "public select seo_metadata" on public.seo_metadata for select using (true);

-- site_settings holds both public and private keys; expose only public keys
create policy "public select site_settings" on public.site_settings for select using (key not like '%.secret' and key not like 'smtp%' and key not like 'imap%');

-- ---- SENSITIVE TABLES: no policies for anon; service role bypasses RLS ----

-- Allow authenticated admins to read their own profile (defense in depth)
create policy "own profile select" on public.profiles for select using (auth.uid() = id);

-- ------------------------------------------------------------
-- STORAGE BUCKETS
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/jpeg','image/png','image/webp','image/svg+xml','image/gif','video/mp4','video/webm','application/pdf'])
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
