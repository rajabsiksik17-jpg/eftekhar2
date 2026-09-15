-- ============================================================
-- Eftekar Clinics - Remove "Featured Services" from homepage
-- Safe: disables the section (services data is untouched).
-- ============================================================

update public.page_sections set is_active = false where section_type = 'featured_services';
