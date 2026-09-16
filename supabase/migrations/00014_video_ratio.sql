-- ============================================================
-- Eftekar Clinics - Video size (aspect ratio)
-- ============================================================

alter table public.videos
  add column if not exists ratio text not null default 'video';
