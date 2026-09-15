-- ============================================================
-- Eftekar Clinics - Remove green accent -> blue identity
-- Safe: updates the appearance accent color only.
-- ============================================================

update public.site_settings
set value = jsonb_set(value, '{accent}', '"#1d4ed8"'::jsonb)
where key = 'appearance';
