-- ============================================================
-- Eftekar Clinics - User notification preferences + default email
-- ============================================================

alter table public.profiles
  add column if not exists notify_email text,
  add column if not exists notify_events jsonb not null default '[]'::jsonb;

alter table public.email_settings
  add column if not exists notification_email text;
