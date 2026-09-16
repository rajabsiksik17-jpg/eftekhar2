-- ============================================================
-- Eftekar Clinics - Homepage restructure
-- Remove "شاهد المزيد عن خدماتنا" (video_content) and reorder
-- so Before/After comes before Doctors.
-- ============================================================

do $$
declare
  home_id uuid := (select id from public.pages where slug='home');
begin
  if home_id is not null then
    update public.page_sections set is_active = false where page_id = home_id and section_type = 'video_content';

    update public.page_sections set display_order = 1 where page_id = home_id and section_type = 'hero';
    update public.page_sections set display_order = 2 where page_id = home_id and section_type = 'statistics';
    update public.page_sections set display_order = 3 where page_id = home_id and section_type = 'introduction';
    update public.page_sections set display_order = 4 where page_id = home_id and section_type = 'service_categories';
    update public.page_sections set display_order = 5 where page_id = home_id and section_type = 'promotional_slider';
    update public.page_sections set display_order = 6 where page_id = home_id and section_type = 'before_after';
    update public.page_sections set display_order = 7 where page_id = home_id and section_type = 'doctors';
    update public.page_sections set display_order = 8 where page_id = home_id and section_type = 'testimonials';
    update public.page_sections set display_order = 9 where page_id = home_id and section_type = 'gallery';
    update public.page_sections set display_order = 10 where page_id = home_id and section_type = 'way_to_clinic';
    update public.page_sections set display_order = 11 where page_id = home_id and section_type = 'final_cta';
  end if;
end $$;
