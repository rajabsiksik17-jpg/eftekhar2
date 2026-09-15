-- ============================================================
-- Eftekar Clinics - Content additions (safe, additive)
-- 1) 10 demo testimonials
-- 2) Remove category/doctor fields from appointment form
-- 3) About page image-text sections
-- 4) Video section content (intro + feature icons)
-- ============================================================

-- ---- 10 demo testimonials (clearly marked is_demo=true) ----
insert into public.testimonials (name_ar, name_en, rating, review_ar, review_en, source, is_demo, display_order) values
('أحمد','Ahmad',5,'تجربة ممتازة وفريق محترم. التقييم كان دقيقًا والشرح واضح قبل اتخاذ أي قرار.','Excellent experience and a respectful team. The assessment was careful and the explanation clear before any decision.','manual',true,2),
('سارة','Sara',5,'اهتمام كبير بالمريض وخصوصية كاملة. أنصح بهم بشدة.','Great patient care and complete privacy. Highly recommended.','manual',true,3),
('محمد','Mohammad',4,'خدمة جيدة وموظفون متعاونون. المتابعة بعد الإجراء كانت ممتازة.','Good service and helpful staff. Follow-up after the procedure was excellent.','manual',true,4),
('ليلى','Layla',5,'شعرت بالراحة والاطمئنان منذ أول زيارة. فريق طبي محترف جدًا.','I felt comfortable and reassured from the first visit. A very professional medical team.','manual',true,5),
('خالد','Khaled',5,'نتائج ممتازة وتواصل مستمر. تجربة تستحق التكرار.','Excellent results and continuous communication. An experience worth repeating.','manual',true,6),
('نور','Noor',5,'تعامل راقٍ ومكان نظيف ومنظم. كل شيء تم شرحه بوضوح.','Elegant treatment and a clean, organized place. Everything was explained clearly.','manual',true,7),
('عمر','Omar',4,'خدمات متعددة تحت سقف واحد وهذا مريح جدًا.','Multiple services under one roof which is very convenient.','manual',true,8),
('هالة','Hala',5,'طاقم طبي محترف ويجيبون على كل الأسئلة بصبر.','A professional medical staff who answer every question patiently.','manual',true,9),
('يوسف','Yousef',5,'تجربة سلسة من البداية للنهاية. شكرًا للفريق.','A smooth experience from start to finish. Thank you to the team.','manual',true,10),
('رنا','Rana',4,'مكان موثوق وخدمات بمعايير عالية.','A trustworthy place with high-standard services.','manual',true,11)
on conflict do nothing;

-- ---- Remove category & doctor from appointment form ----
delete from public.form_fields
where form_id = (select id from public.forms where key = 'appointment')
  and name in ('category', 'doctor');

-- ---- About page: two image-text sections ----
do $$
declare
  about_id uuid := (select id from public.pages where slug='about');
begin
  if about_id is not null then
    insert into public.page_sections (page_id, section_type, title_ar, title_en, content, settings, display_order) values
      (about_id, 'image_text', 'رعاية تليق بكم', 'Care That Suits You',
       '{"ar":{"text":"نؤمن في عيادات افتخار أن الرعاية الطبية تجربة متكاملة تبدأ من الاستماع والتقييم الدقيق، وتمتد إلى المتابعة والاهتمام بكل التفاصيل."},"en":{"text":"At Eftekar Clinics we believe medical care is a complete experience that starts with listening and careful assessment, and extends to follow-up and attention to every detail."},"image":"","buttons":[]}'::jsonb,
       '{"layout":"image_left"}'::jsonb, 10),
      (about_id, 'image_text', 'تقنيات حديثة لنتائج أفضل', 'Modern Technology for Better Results',
       '{"ar":{"text":"نعتمد على أحدث التقنيات والأجهزة المتاحة وفق طبيعة كل خدمة، مع فريق متخصص يعمل وفق أعلى معايير السلامة والجودة."},"en":{"text":"We rely on the latest technologies and equipment according to each service, with a specialized team working to the highest standards of safety and quality."},"image":"","buttons":[]}'::jsonb,
       '{"layout":"image_right"}'::jsonb, 11)
    on conflict do nothing;
  end if;
end $$;

-- ---- Video section content: intro text + meaningful feature icons ----
update public.page_sections
set content = '{"ar":{"text":"نقدم لكم لمحة عن خدماتنا وطريقة عملنا في عيادات افتخار، حيث نجمع بين الخبرة الطبية والتقنيات الحديثة لتقديم تجربة علاجية متكاملة."},"en":{"text":"A glimpse into our services and how we work at Eftekar Clinics, where medical expertise meets modern technology for a complete care experience."},"video":{"youtube_url":"","thumbnail":"","autoplay":false,"muted":true,"loop":false,"controls":true,"overlay":true,"modal":true},"features":[{"icon":"Stethoscope","ar":"فريق طبي متخصص","en":"Specialized Medical Team"},{"icon":"Cpu","ar":"تقنيات حديثة","en":"Modern Technology"},{"icon":"HeartHandshake","ar":"رعاية متكاملة","en":"Integrated Patient Care"},{"icon":"ShieldCheck","ar":"خصوصية وأمان","en":"Privacy & Safety"}],"cta":{"label_ar":"احجز موعد","label_en":"Book Appointment","url":"/appointment"}}'::jsonb
where section_type = 'video_content';
