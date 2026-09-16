-- ============================================================
-- Eftekar Clinics - Combined gallery + videos homepage section
-- ============================================================

do $$
declare
  home_id uuid := (select id from public.pages where slug='home');
begin
  if home_id is not null then
    update public.page_sections set is_active = false where page_id = home_id and section_type = 'gallery';

    insert into public.page_sections (page_id, section_type, title_ar, title_en, subtitle_ar, subtitle_en, content, settings, display_order)
    select home_id, 'gallery_videos', 'معرض الصور والفيديوهات', 'Gallery & Videos', null, null, '{}'::jsonb, '{}'::jsonb, 9
    where not exists (select 1 from public.page_sections where page_id = home_id and section_type = 'gallery_videos');
  end if;
end $$;
