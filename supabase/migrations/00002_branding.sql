-- ============================================================
-- Eftekar Clinics - Branding / Appearance settings
-- Safe migration: only inserts new site_settings keys.
-- ============================================================

insert into public.site_settings (key, value) values
  ('appearance', '{"primary":"#2563eb","secondary":"#0ea5e9","accent":"#0d9488","favicon":""}'::jsonb),
  ('analytics', '{"ga4_enabled":false,"ga4_id":""}'::jsonb),
  ('favicon', '{"text":""}'::jsonb)
on conflict (key) do nothing;
