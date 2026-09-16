-- ============================================================
-- Eftekar Clinics - Reorder About page: image-text first
-- ============================================================

do $$
declare
  about_id uuid := (select id from public.pages where slug='about');
begin
  if about_id is not null then
    update public.page_sections set display_order = 6 where page_id = about_id and section_type = 'introduction';
    update public.page_sections set display_order = 7 where page_id = about_id and section_type = 'text' and title_ar = 'رؤيتنا';
    update public.page_sections set display_order = 8 where page_id = about_id and section_type = 'text' and title_ar = 'رسالتنا';
    update public.page_sections set display_order = 1 where page_id = about_id and section_type = 'image_text' and title_ar = 'رعاية تليق بكم';
    update public.page_sections set display_order = 2 where page_id = about_id and section_type = 'image_text' and title_ar = 'تقنيات حديثة لنتائج أفضل';
  end if;
end $$;
