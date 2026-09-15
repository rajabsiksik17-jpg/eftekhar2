-- ============================================================
-- Eftekar Medical & Therapeutic Clinics - Seed Data
-- Run ONCE after migrations. Entities with unique slugs are
-- idempotent; run twice only after truncating content tables.
-- ============================================================

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
insert into public.roles (name, slug, description, is_system) values
  ('Super Admin', 'super_admin', 'Full unrestricted access', true),
  ('Administrator', 'administrator', 'Manage all content and settings', true),
  ('Content Manager', 'content_manager', 'Manage pages and content', false),
  ('SEO Manager', 'seo_manager', 'Manage SEO metadata', false),
  ('Appointment Manager', 'appointment_manager', 'Manage appointments', false),
  ('Doctor Manager', 'doctor_manager', 'Manage doctors and staff', false),
  ('Media Manager', 'media_manager', 'Manage media, gallery and videos', false),
  ('Analytics Viewer', 'analytics_viewer', 'View analytics only', false),
  ('Support Agent', 'support_agent', 'Handle messages and appointments', false)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- PERMISSIONS
-- ------------------------------------------------------------
insert into public.permissions (name, slug, "group") values
  ('View pages', 'pages.view', 'pages'),
  ('Create pages', 'pages.create', 'pages'),
  ('Update pages', 'pages.update', 'pages'),
  ('Delete pages', 'pages.delete', 'pages'),
  ('View services', 'services.view', 'services'),
  ('Create services', 'services.create', 'services'),
  ('Update services', 'services.update', 'services'),
  ('Delete services', 'services.delete', 'services'),
  ('View categories', 'categories.view', 'services'),
  ('Create categories', 'categories.create', 'services'),
  ('Update categories', 'categories.update', 'services'),
  ('Delete categories', 'categories.delete', 'services'),
  ('View doctors', 'doctors.view', 'doctors'),
  ('Create doctors', 'doctors.create', 'doctors'),
  ('Update doctors', 'doctors.update', 'doctors'),
  ('Delete doctors', 'doctors.delete', 'doctors'),
  ('View appointments', 'appointments.view', 'appointments'),
  ('Update appointments', 'appointments.update', 'appointments'),
  ('View messages', 'messages.view', 'messages'),
  ('Update messages', 'messages.update', 'messages'),
  ('View media', 'media.view', 'media'),
  ('Upload media', 'media.upload', 'media'),
  ('Delete media', 'media.delete', 'media'),
  ('View gallery', 'gallery.view', 'media'),
  ('Manage gallery', 'gallery.manage', 'media'),
  ('View videos', 'videos.view', 'media'),
  ('Manage videos', 'videos.manage', 'media'),
  ('View testimonials', 'testimonials.view', 'content'),
  ('Manage testimonials', 'testimonials.manage', 'content'),
  ('View seo', 'seo.view', 'seo'),
  ('Update seo', 'seo.update', 'seo'),
  ('View analytics', 'analytics.view', 'analytics'),
  ('View users', 'users.view', 'users'),
  ('Create users', 'users.create', 'users'),
  ('Update users', 'users.update', 'users'),
  ('Delete users', 'users.delete', 'users'),
  ('View security', 'security.view', 'security'),
  ('View settings', 'settings.view', 'settings'),
  ('Update settings', 'settings.update', 'settings')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- ROLE PERMISSIONS
-- ------------------------------------------------------------
do $$
declare
  admin_id uuid := (select id from public.roles where slug='administrator');
  content_id uuid := (select id from public.roles where slug='content_manager');
  seo_id uuid := (select id from public.roles where slug='seo_manager');
  appt_id uuid := (select id from public.roles where slug='appointment_manager');
  doctor_id uuid := (select id from public.roles where slug='doctor_manager');
  media_id uuid := (select id from public.roles where slug='media_manager');
  analytics_id uuid := (select id from public.roles where slug='analytics_viewer');
  support_id uuid := (select id from public.roles where slug='support_agent');
  pid uuid;
begin
  -- Administrator: everything except user management/security
  for pid in select id from public.permissions where slug not in ('users.view','users.create','users.update','users.delete','security.view')
  loop
    insert into public.role_permissions (role_id, permission_id) values (admin_id, pid) on conflict do nothing;
  end loop;

  for pid in select id from public.permissions where slug in ('pages.view','pages.create','pages.update','pages.delete')
  loop
    insert into public.role_permissions (role_id, permission_id) values (content_id, pid) on conflict do nothing;
  end loop;

  for pid in select id from public.permissions where slug in ('seo.view','seo.update')
  loop
    insert into public.role_permissions (role_id, permission_id) values (seo_id, pid) on conflict do nothing;
  end loop;

  for pid in select id from public.permissions where slug in ('appointments.view','appointments.update')
  loop
    insert into public.role_permissions (role_id, permission_id) values (appt_id, pid) on conflict do nothing;
  end loop;

  for pid in select id from public.permissions where slug in ('doctors.view','doctors.create','doctors.update','doctors.delete')
  loop
    insert into public.role_permissions (role_id, permission_id) values (doctor_id, pid) on conflict do nothing;
  end loop;

  for pid in select id from public.permissions where slug in ('media.view','media.upload','media.delete','gallery.view','gallery.manage','videos.view','videos.manage')
  loop
    insert into public.role_permissions (role_id, permission_id) values (media_id, pid) on conflict do nothing;
  end loop;

  insert into public.role_permissions (role_id, permission_id)
  values (analytics_id, (select id from public.permissions where slug='analytics.view'))
  on conflict do nothing;

  for pid in select id from public.permissions where slug in ('appointments.view','appointments.update','messages.view','messages.update')
  loop
    insert into public.role_permissions (role_id, permission_id) values (support_id, pid) on conflict do nothing;
  end loop;
end $$;

-- ------------------------------------------------------------
-- SERVICE CATEGORIES
-- ------------------------------------------------------------
insert into public.service_categories (slug, name_ar, name_en, description_ar, description_en, content_ar, content_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en) values
(
  'bariatric-surgery',
  'جراحة السمنة',
  'Bariatric Surgery',
  'إجراءات جراحية لعلاج حالات السمنة بعد تقييم طبي متخصص ومتابعة شاملة.',
  'Surgical procedures for treating obesity following specialized medical assessment and comprehensive follow-up.',
  'جراحة السمنة تشمل مجموعة من الإجراءات الجراحية التي تهدف إلى المساعدة على فقدان الوزن وتحسين الحالات الصحية المرتبطة بالسمنة، ويتم تحديد مدى ملاءمة كل إجراء بعد تقييم طبي شامل.',
  'Bariatric surgery includes surgical procedures aimed at supporting weight loss and improving obesity-related conditions, with suitability determined after a comprehensive medical assessment.',
  'Scale', true, 1,
  'جراحة السمنة في عمّان | عيادات افتخار',
  'Bariatric Surgery in Amman | Eftekar Clinics',
  'تعرف على خدمات جراحة السمنة في عيادات افتخار بعمّان، مع تقييم طبي متخصص ومتابعة شاملة قبل وبعد الإجراء.',
  'Learn about bariatric surgery services at Eftekar Clinics in Amman, with specialized assessment and comprehensive follow-up before and after the procedure.'
),
(
  'plastic-cosmetic-surgery',
  'جراحة التجميل',
  'Plastic & Cosmetic Surgery',
  'إجراءات تجميلية تهدف إلى تحسين الشكل والتناسق بعد تقييم طبي ومناقشة النتائج المتوقعة.',
  'Cosmetic procedures aimed at improving appearance and harmony following medical assessment and discussion of expected outcomes.',
  'جراحة التجميل تشمل مجموعة من الإجراءات التي تهدف إلى تحسين شكل الجسم والوجه والتناسق العام، مع تحديد التقنية المناسبة لكل حالة.',
  'Plastic surgery includes procedures aimed at improving the shape of the body and face and overall harmony, with the appropriate technique chosen per case.',
  'Sparkles', true, 2,
  'جراحة التجميل في عمّان | عيادات افتخار',
  'Plastic & Cosmetic Surgery in Amman | Eftekar Clinics',
  'اكتشف خدمات جراحة التجميل في عيادات افتخار بعمّان بإشراف أطباء مختصين وتقنيات حديثة مع مراعاة خصوصية كل حالة.',
  'Explore plastic and cosmetic surgery services at Eftekar Clinics in Amman, supervised by specialists with modern techniques and respect for each case.'
),
(
  'ophthalmology-eye-surgery',
  'جراحة العيون',
  'Ophthalmology & Eye Surgery',
  'خدمات متخصصة في طب وجراحة العيون تهدف إلى تقييم صحة العين وتحديد الخطة العلاجية المناسبة.',
  'Specialized ophthalmology and eye surgery services aimed at assessing eye health and determining an appropriate treatment plan.',
  'توفر عيادات افتخار خدمات متخصصة في طب العيون تعتمد على الفحص الطبي المناسب لكل حالة وتحديد الخطة العلاجية وفق تقييم الطبيب المختص.',
  'Eftekar Clinics provides specialized ophthalmology services based on appropriate examination for each case and a treatment plan per the specialists assessment.',
  'Eye', true, 3,
  'طب وجراحة العيون في عمّان | عيادات افتخار',
  'Ophthalmology & Eye Surgery in Amman | Eftekar Clinics',
  'خدمات متخصصة في طب وجراحة العيون في عيادات افتخار بعمّان لفحص صحة العين وتشخيص الحالات وتحديد العلاج المناسب.',
  'Specialized ophthalmology and eye surgery services at Eftekar Clinics in Amman for eye health assessment, diagnosis and appropriate treatment.'
),
(
  'comprehensive-dental-care',
  'كافة علاجات الأسنان',
  'Comprehensive Dental Care',
  'خدمات متكاملة لطب الأسنان للحفاظ على صحة الأسنان واللثة وتحسين مظهر الابتسامة.',
  'Comprehensive dental care services to maintain dental and gum health and improve the appearance of the smile.',
  'توفر عيادات افتخار خدمات متكاملة في طب الأسنان تبدأ بالتقييم والتشخيص ثم تحديد الخطة العلاجية المناسبة لكل حالة.',
  'Eftekar Clinics provides comprehensive dental services starting with assessment and diagnosis, then determining the appropriate treatment plan for each case.',
  'Smile', true, 4,
  'علاجات الأسنان في عمّان | عيادات افتخار',
  'Comprehensive Dental Care in Amman | Eftekar Clinics',
  'خدمات متكاملة لعلاج الأسنان في عيادات افتخار بعمّان للحفاظ على صحة الأسنان واللثة وتحسين مظهر الابتسامة.',
  'Comprehensive dental care services at Eftekar Clinics in Amman to maintain dental and gum health and improve your smile.'
),
(
  'erectile-dysfunction-treatment',
  'جراحة ضعف الانتصاب',
  'Erectile Dysfunction Treatment & Surgery',
  'خيارات علاجية لبعض حالات ضعف الانتصاب بعد تقييم متخصص ومناقشة الخيارات.',
  'Treatment options for certain cases of erectile dysfunction following specialized assessment and discussion of options.',
  'تشمل الخدمة تقييم الحالة بشكل متخصص ومناقشة الخيارات العلاجية والمخاطر والفوائد مع المريض قبل اتخاذ القرار.',
  'The service includes specialized assessment and discussion of treatment options, risks and benefits with the patient before making a decision.',
  'HeartPulse', true, 5,
  'علاج ضعف الانتصاب وجراحة الدعامات | عيادات افتخار',
  'Erectile Dysfunction Treatment & Surgery | Eftekar Clinics',
  'خيارات علاجية لبعض حالات ضعف الانتصاب في عيادات افتخار بعمّان مع تقييم متخصص ومناقشة شاملة للخيارات.',
  'Treatment options for certain erectile dysfunction cases at Eftekar Clinics in Amman with specialized assessment and thorough discussion of options.'
)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'gastric-sleeve-surgery', 'تكميم المعدة', 'Gastric Sleeve Surgery',
  'تُعد خدمة تكميم المعدة من الإجراءات الطبية المستخدمة لعلاج حالات السمنة وفق تقييم طبي متخصص، حيث تهدف إلى تقليل حجم المعدة والمساعدة على فقدان الوزن وتحسين بعض الحالات الصحية المرتبطة بالسمنة. تبدأ الرحلة بتقييم شامل للحالة الصحية ونمط الحياة، ثم تحديد مدى ملاءمة الإجراء للمريض، مع توفير المتابعة الطبية والتغذوية المناسبة.',
  'Gastric sleeve surgery is a medical procedure used to treat obesity according to a specialized medical assessment. It aims to reduce stomach size, support weight loss and improve certain obesity-related conditions. The journey begins with a comprehensive assessment of health and lifestyle, then determines the suitability of the procedure, with appropriate medical and nutritional follow-up.',
  'Scissors', true, 1,
  'تكميم المعدة في عمّان | عيادات افتخار',
  'Gastric Sleeve Surgery in Amman | Eftekar Clinics',
  'تعرف على خدمة تكميم المعدة في عيادات افتخار بعمّان، بدءًا من التقييم الطبي وحتى المتابعة بعد الإجراء، واحجز موعدًا للاستشارة.',
  'Learn about gastric sleeve surgery at Eftekar Clinics in Amman, from medical assessment to post-procedure follow-up, and book a consultation.'
from public.service_categories where slug='bariatric-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'gastric-bypass-surgery', 'تحويل المسار', 'Gastric Bypass Surgery',
  'تحويل المسار أحد الإجراءات الجراحية المستخدمة في علاج بعض حالات السمنة، ويتم اختيار مدى ملاءمته بعد تقييم الحالة الصحية والتاريخ الطبي للمريض. يهدف الإجراء إلى المساعدة على فقدان الوزن وتحسين بعض المشكلات الصحية المرتبطة بالسمنة، مع الحاجة إلى متابعة طبية وغذائية مستمرة.',
  'Gastric bypass is a surgical procedure used to treat certain cases of obesity, with suitability determined after assessing the health condition and medical history. It aims to support weight loss and improve certain obesity-related health problems, requiring ongoing medical and nutritional follow-up.',
  'Route', false, 2,
  'تحويل المسار في عمّان | عيادات افتخار',
  'Gastric Bypass Surgery in Amman | Eftekar Clinics',
  'تعرف على خدمة تحويل المسار في عيادات افتخار بعمّان، من التقييم الطبي حتى المتابعة المستمرة، واحجز موعدًا للاستشارة.',
  'Learn about gastric bypass surgery at Eftekar Clinics in Amman, from assessment to ongoing follow-up, and book a consultation.'
from public.service_categories where slug='bariatric-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'abdominoplasty-tummy-tuck', 'شد البطن', 'Abdominoplasty / Tummy Tuck',
  'خدمة شد البطن هي إجراء تجميلي يهدف إلى تحسين شكل منطقة البطن من خلال التعامل مع الجلد الزائد والترهلات، وقد تشمل شد العضلات بحسب الحالة. يتم تحديد مدى ملاءمة الإجراء بعد تقييم طبي شامل ومناقشة النتائج المتوقعة مع المريض.',
  'Abdominoplasty is a cosmetic procedure aimed at improving the appearance of the abdominal area by addressing excess skin and laxity, and may include muscle tightening depending on the case. Suitability is determined after a comprehensive medical assessment and discussion of expected outcomes with the patient.',
  'Layout', true, 1,
  'شد البطن في عمّان | عيادات افتخار',
  'Abdominoplasty / Tummy Tuck in Amman | Eftekar Clinics',
  'تعرف على خدمة شد البطن في عيادات افتخار بعمّان، من التقييم الطبي حتى التعافي، واحجز موعدًا للاستشارة.',
  'Learn about abdominoplasty at Eftekar Clinics in Amman, from assessment to recovery, and book a consultation.'
from public.service_categories where slug='plastic-cosmetic-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'body-contouring', 'نحت الجسم', 'Body Contouring',
  'نحت الجسم هو مجموعة من الإجراءات التجميلية التي تهدف إلى تحسين تناسق الجسم والتعامل مع مناطق الدهون أو الجلد الزائد بحسب حالة كل شخص. يتم اختيار التقنية المناسبة بعد تقييم طبي ومناقشة أهداف المريض.',
  'Body contouring is a group of cosmetic procedures aimed at improving body harmony and addressing areas of excess fat or skin according to each persons case. The appropriate technique is chosen after a medical assessment and discussion of the patients goals.',
  'Move', false, 2,
  'نحت الجسم في عمّان | عيادات افتخار',
  'Body Contouring in Amman | Eftekar Clinics',
  'تعرف على خدمات نحت الجسم في عيادات افتخار بعمّان واختيار التقنية المناسبة بعد التقييم الطبي.',
  'Learn about body contouring services at Eftekar Clinics in Amman and choosing the right technique after medical assessment.'
from public.service_categories where slug='plastic-cosmetic-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'breast-augmentation', 'تكبير الثدي', 'Breast Augmentation',
  'تكبير الثدي إجراء تجميلي يهدف إلى تحسين حجم وشكل الثدي والتناسق العام للجسم. يتم تحديد التقنية والحجم المناسبين لكل حالة بعد تقييم طبي ومناقشة الخيارات المتاحة والمخاطر والنتائج المتوقعة.',
  'Breast augmentation is a cosmetic procedure aimed at improving breast size, shape and overall body harmony. The appropriate technique and size are determined for each case after a medical assessment and discussion of available options, risks and expected outcomes.',
  'Heart', false, 3,
  'تكبير الثدي في عمّان | عيادات افتخار',
  'Breast Augmentation in Amman | Eftekar Clinics',
  'تعرف على خدمة تكبير الثدي في عيادات افتخار بعمّان مع تقييم طبي ومناقشة الخيارات والنتائج المتوقعة.',
  'Learn about breast augmentation at Eftekar Clinics in Amman with medical assessment and discussion of options and outcomes.'
from public.service_categories where slug='plastic-cosmetic-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'rhinoplasty', 'تجميل الأنف', 'Rhinoplasty',
  'تجميل الأنف هو إجراء يمكن أن يهدف إلى تحسين شكل الأنف أو معالجة بعض المشكلات الوظيفية بحسب الحالة. يتم التخطيط للإجراء بعد تقييم شكل الوجه ووظيفة الأنف والحالة الصحية للمريض.',
  'Rhinoplasty is a procedure that may aim to improve the shape of the nose or address certain functional issues depending on the case. The procedure is planned after assessing facial shape, nasal function and the patients health.',
  'Triangle', false, 4,
  'تجميل الأنف في عمّان | عيادات افتخار',
  'Rhinoplasty in Amman | Eftekar Clinics',
  'تعرف على خدمة تجميل الأنف في عيادات افتخار بعمّان مع تقييم دقيق لشكل الوجه ووظيفة الأنف.',
  'Learn about rhinoplasty at Eftekar Clinics in Amman with careful assessment of facial shape and nasal function.'
from public.service_categories where slug='plastic-cosmetic-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'blepharoplasty', 'شد الجفون', 'Blepharoplasty',
  'شد الجفون إجراء تجميلي يهدف إلى التعامل مع بعض حالات ترهل الجلد أو الانتفاخ حول العينين، ويتم تحديد مدى ملاءمة الإجراء بعد تقييم الحالة وتشريح منطقة العين.',
  'Blepharoplasty is a cosmetic procedure aimed at addressing certain cases of skin laxity or puffiness around the eyes, with suitability determined after assessing the case and anatomy of the eye area.',
  'Eye', false, 5,
  'شد الجفون في عمّان | عيادات افتخار',
  'Blepharoplasty in Amman | Eftekar Clinics',
  'تعرف على خدمة شد الجفون في عيادات افتخار بعمّان لتقييم حالات الترهل والانتفاخ حول العينين.',
  'Learn about blepharoplasty at Eftekar Clinics in Amman to assess laxity and puffiness around the eyes.'
from public.service_categories where slug='plastic-cosmetic-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'ophthalmology', 'طب العيون', 'Ophthalmology',
  'توفر عيادات افتخار خدمات متخصصة في طب العيون تهدف إلى تقييم صحة العين والنظر وتشخيص الحالات التي تحتاج إلى متابعة أو علاج. تعتمد الخدمة على الفحص الطبي المناسب لكل حالة وتحديد الخطة العلاجية وفق تقييم الطبيب المختص.',
  'Eftekar Clinics provides specialized ophthalmology services aimed at assessing eye health and vision and diagnosing cases that require follow-up or treatment. The service relies on appropriate examination for each case and determining the treatment plan per the specialists assessment.',
  'Eye', true, 1,
  'طب العيون في عمّان | عيادات افتخار',
  'Ophthalmology in Amman | Eftekar Clinics',
  'خدمات متخصصة في طب العيون في عيادات افتخار بعمّان لتقييم صحة العين والنظر وتحديد الخطة العلاجية المناسبة.',
  'Specialized ophthalmology services at Eftekar Clinics in Amman to assess eye health and vision and determine an appropriate treatment plan.'
from public.service_categories where slug='ophthalmology-eye-surgery'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'dental-care', 'طب الأسنان', 'Dental Care',
  'توفر عيادات افتخار خدمات متكاملة في طب الأسنان تهدف إلى الحفاظ على صحة الأسنان واللثة وتحسين مظهر الابتسامة. تبدأ الخدمات بالتقييم والتشخيص ثم تحديد الخطة العلاجية المناسبة لكل حالة.',
  'Eftekar Clinics provides comprehensive dental services aimed at maintaining dental and gum health and improving the appearance of the smile. Services begin with assessment and diagnosis, then determining the appropriate treatment plan for each case.',
  'Smile', true, 1,
  'طب الأسنان في عمّان | عيادات افتخار',
  'Dental Care in Amman | Eftekar Clinics',
  'خدمات متكاملة في طب الأسنان في عيادات افتخار بعمّان للحفاظ على صحة الأسنان واللثة وتحسين الابتسامة.',
  'Comprehensive dental care services at Eftekar Clinics in Amman to maintain dental and gum health and improve the smile.'
from public.service_categories where slug='comprehensive-dental-care'
on conflict (slug) do nothing;

insert into public.services (category_id, slug, name_ar, name_en, description_ar, description_en, icon, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
select id, 'penile-implant-surgery', 'زراعة الدعامات', 'Penile Implant Surgery',
  'زراعة الدعامات أحد الخيارات الطبية المستخدمة لعلاج بعض حالات ضعف الانتصاب التي لا تستجيب للخيارات العلاجية الأخرى. يتم تقييم الحالة بشكل متخصص ومناقشة الخيارات والمخاطر والفوائد مع المريض قبل اتخاذ القرار العلاجي.',
  'Penile implant surgery is one of the medical options used to treat certain cases of erectile dysfunction that do not respond to other treatment options. The case is assessed specially and options, risks and benefits are discussed with the patient before making a treatment decision.',
  'HeartPulse', true, 1,
  'زراعة الدعامات لعلاج ضعف الانتصاب | عيادات افتخار',
  'Penile Implant Surgery for Erectile Dysfunction | Eftekar Clinics',
  'تعرف على خدمة زراعة الدعامات لعلاج بعض حالات ضعف الانتصاب في عيادات افتخار بعمّان مع تقييم متخصص.',
  'Learn about penile implant surgery for certain erectile dysfunction cases at Eftekar Clinics in Amman with specialized assessment.'
from public.service_categories where slug='erectile-dysfunction-treatment'
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- SERVICE CONTENT BLOCKS
-- ------------------------------------------------------------
do $$
declare
  sid uuid;
  blocks jsonb;
  b jsonb;
begin
  for sid, blocks in
    select s.id, jsonb_build_array(
      jsonb_build_object('ar','ما هو تكميم المعدة؟','en','What is gastric sleeve surgery?','text','تكميم المعدة هو إجراء جراحي يتم خلاله تقليل حجم المعدة، مما يساعد على تقليل كمية الطعام التي يمكن تناولها والمساعدة على فقدان الوزن.'),
      jsonb_build_object('ar','لمن قد يكون مناسبًا؟','en','Who may it suit?','text','يتم تحديد مدى ملاءمة الإجراء بعد تقييم شامل للحالة الصحية ونمط الحياة والتاريخ الطبي.'),
      jsonb_build_object('ar','التقييم الطبي','en','Medical assessment','text','يشمل التقييم الفحوصات الطبية اللازمة وتحديد مدى ملاءمة الإجراء للمريض.'),
      jsonb_build_object('ar','مراحل الإجراء','en','Procedure stages','text','يتم شرح مراحل الإجراء بشكل كامل قبل اتخاذ القرار.'),
      jsonb_build_object('ar','المتابعة','en','Follow-up','text','تشمل المتابعة الطبية والتغذوية المناسبة بعد الإجراء.'),
      jsonb_build_object('ar','التغذية بعد الإجراء','en','Nutrition after the procedure','text','يتم تقديم إرشادات غذائية تتناسب مع مرحلة ما بعد الإجراء.'),
      jsonb_build_object('ar','الأسئلة الشائعة','en','FAQ','text','أجوبة عن الأسئلة الأكثر شيوعًا حول الإجراء.'),
      jsonb_build_object('ar','حجز موعد','en','Book an appointment','text','احجز موعدًا للاستشارة والتقييم.')
    )
    from public.services s where s.slug='gastric-sleeve-surgery'
  loop
    for i in 0 .. jsonb_array_length(blocks)-1 loop
      b := blocks->i;
      insert into public.service_content_blocks (service_id, block_type, title_ar, title_en, content_ar, content_en, display_order)
      values (sid, 'text', b->>'ar', b->>'en', b->>'text', b->>'text', i)
      on conflict do nothing;
    end loop;
  end loop;

  for sid in select id from public.services where slug='gastric-bypass-surgery' loop
    insert into public.service_content_blocks (service_id, block_type, title_ar, title_en, content_ar, content_en, display_order) values
      (sid,'text','ما هو تحويل المسار؟','What is gastric bypass?','تحويل المسار إجراء جراحي يستخدم لعلاج بعض حالات السمنة بعد تقييم طبي متخصص.','Gastric bypass is a surgical procedure used to treat certain cases of obesity after specialized assessment.',0),
      (sid,'text','الحالات المناسبة','Suitable cases','يتم اختيار مدى ملاءمة الإجراء بعد تقييم الحالة الصحية والتاريخ الطبي.','Suitability is determined after assessing health condition and medical history.',1),
      (sid,'text','التقييم','Assessment','يشمل التقييم الفحوصات اللازمة وتحديد الخطة العلاجية المناسبة.','Assessment includes necessary tests and determining the appropriate plan.',2),
      (sid,'text','الإجراء','The procedure','يتم شرح مراحل الإجراء بالكامل قبل اتخاذ القرار.','The procedure stages are fully explained before deciding.',3),
      (sid,'text','المتابعة','Follow-up','تتطلب الحالة متابعة طبية وغذائية مستمرة بعد الإجراء.','The case requires ongoing medical and nutritional follow-up.',4),
      (sid,'text','التغذية','Nutrition','يتم تقديم إرشادات غذائية تتناسب مع المرحلة.','Nutritional guidance is provided according to the stage.',5),
      (sid,'text','الأسئلة الشائعة','FAQ','أجوبة عن الأسئلة الشائعة حول الإجراء.','Answers to common questions about the procedure.',6),
      (sid,'text','حجز موعد','Book an appointment','احجز موعدًا للاستشارة والتقييم.','Book a consultation appointment.',7)
    on conflict do nothing;
  end loop;

  for sid in select id from public.services where slug='abdominoplasty-tummy-tuck' loop
    insert into public.service_content_blocks (service_id, block_type, title_ar, title_en, content_ar, content_en, display_order) values
      (sid,'text','نبذة عن الخدمة','About the service','شد البطن إجراء تجميلي يهدف إلى تحسين شكل منطقة البطن.','Abdominoplasty is a cosmetic procedure aimed at improving the abdominal area.',0),
      (sid,'text','الحالات المناسبة','Suitable cases','يتم تحديد مدى الملاءمة بعد تقييم طبي شامل.','Suitability is determined after a comprehensive assessment.',1),
      (sid,'text','التقييم','Assessment','يشمل التقييم مناقشة النتائج المتوقعة مع المريض.','Assessment includes discussing expected outcomes with the patient.',2),
      (sid,'text','خطوات الإجراء','Procedure steps','يتم شرح خطوات الإجراء قبل اتخاذ القرار.','The procedure steps are explained before deciding.',3),
      (sid,'text','التعافي','Recovery','يتم تقديم إرشادات حول مرحلة التعافي.','Guidance on the recovery phase is provided.',4),
      (sid,'text','النتائج المتوقعة','Expected results','النتائج تختلف من حالة لأخرى ويتم مناقشتها قبل الإجراء.','Results vary by case and are discussed before the procedure.',5),
      (sid,'text','الأسئلة الشائعة','FAQ','أجوبة عن الأسئلة الشائعة حول الخدمة.','Answers to common questions about the service.',6),
      (sid,'text','حجز موعد','Book an appointment','احجز موعدًا للاستشارة.','Book a consultation appointment.',7)
    on conflict do nothing;
  end loop;
end $$;

-- ------------------------------------------------------------
-- DOCTORS & STAFF
-- ------------------------------------------------------------
insert into public.doctors (slug, name_ar, name_en, type, specialty_ar, specialty_en, bio_ar, bio_en, is_featured, display_order, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en) values
('ashraf-abu-khait','دكتور أشرف أبو خيط','Dr. Ashraf Abu Khait','doctor','جراحة عامة وجراحة المنظار والسمنة','General, Laparoscopic & Bariatric Surgery','طبيب مختص في الجراحة العامة وجراحة المنظار والسمنة ضمن فريق عيادات افتخار.','A physician specializing in general, laparoscopic and bariatric surgery within the Eftekar Clinics team.',true,1,'دكتور أشرف أبو خيط | عيادات افتخار','Dr. Ashraf Abu Khait | Eftekar Clinics','تعرف على دكتور أشرف أبو خيط، مختص في الجراحة العامة وجراحة المنظار والسمنة في عيادات افتخار بعمّان.','Meet Dr. Ashraf Abu Khait, specializing in general, laparoscopic and bariatric surgery at Eftekar Clinics in Amman.'),
('anas-bani-yaseen','دكتور أنس بني ياسين','Dr. Anas Bani Yaseen','doctor','جراحة','Surgery','طبيب جراح ضمن فريق عيادات افتخار.','A surgeon within the Eftekar Clinics team.',true,2,'دكتور أنس بني ياسين | عيادات افتخار','Dr. Anas Bani Yaseen | Eftekar Clinics','تعرف على دكتور أنس بني ياسين، طبيب جراح في عيادات افتخار بعمّان.','Meet Dr. Anas Bani Yaseen, a surgeon at Eftekar Clinics in Amman.'),
('yousef-abdullah','دكتور يوسف عبدالله','Dr. Yousef Abdullah','doctor','طب الأسنان','Dentistry','طبيب أسنان ضمن فريق عيادات افتخار.','A dentist within the Eftekar Clinics team.',true,3,'دكتور يوسف عبدالله | عيادات افتخار','Dr. Yousef Abdullah | Eftekar Clinics','تعرف على دكتور يوسف عبدالله، طبيب أسنان في عيادات افتخار بعمّان.','Meet Dr. Yousef Abdullah, a dentist at Eftekar Clinics in Amman.'),
('rasha-al-faraji','د. رشا الفراجي','Dr. Rasha Al-Faraji','doctor','طب العيون','Ophthalmology','طبيبة عيون ضمن فريق عيادات افتخار.','An ophthalmologist within the Eftekar Clinics team.',true,4,'د. رشا الفراجي | عيادات افتخار','Dr. Rasha Al-Faraji | Eftekar Clinics','تعرف على د. رشا الفراجي، طبيبة عيون في عيادات افتخار بعمّان.','Meet Dr. Rasha Al-Faraji, an ophthalmologist at Eftekar Clinics in Amman.'),
('ammar-abu-dhouwaba','د. عمار أبو ذوابة','Dr. Ammar Abu Dhouwaba','doctor','طب الأسنان','Dentistry','طبيب أسنان ضمن فريق عيادات افتخار.','A dentist within the Eftekar Clinics team.',true,5,'د. عمار أبو ذوابة | عيادات افتخار','Dr. Ammar Abu Dhouwaba | Eftekar Clinics','تعرف على د. عمار أبو ذوابة، طبيب أسنان في عيادات افتخار بعمّان.','Meet Dr. Ammar Abu Dhouwaba, a dentist at Eftekar Clinics in Amman.'),
('lamees-al-zoubi','لميس محمد الزعبي','Lamees Mohammad Al-Zoubi','management','المدير المالي','Finance Manager','لميس محمد الزعبي، المدير المالي في عيادات افتخار.','Lamees Mohammad Al-Zoubi, Finance Manager at Eftekar Clinics.',false,6,null,null,null,null)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- STATISTICS
-- ------------------------------------------------------------
insert into public.statistics (number, label_ar, label_en, icon, suffix, display_order) values
  (10, 'سنوات خبرة', 'Years of Experience', 'Award', '+', 1),
  (5000, 'مريض', 'Patients', 'Users', '+', 2),
  (10, 'خدمات طبية', 'Medical Services', 'Stethoscope', '+', 3),
  (5, 'تخصصات رئيسية', 'Main Specialties', 'Layers', '', 4)
on conflict do nothing;

-- ------------------------------------------------------------
-- HERO SLIDES
-- ------------------------------------------------------------
insert into public.hero_slides (title_ar, title_en, subtitle_ar, subtitle_en, description_ar, description_en, bullets, primary_button, secondary_button, text_align, content_position, overlay, display_order) values
(
  'استعد لحياة جديدة وثقة أكبر',
  'Get Ready for a New Life and Greater Confidence',
  'عيادات افتخار للخدمات العلاجية',
  'Eftekar Medical & Therapeutic Clinics',
  'كل تحدٍ يمكن تحويله إلى فرصة. في عيادات افتخار نقدم خدمات طبية وتجميلية متكاملة تهدف إلى تحسين جودة حياتك وتعزيز ثقتك بنفسك.',
  'Every challenge can be turned into an opportunity. At Eftekar Clinics we provide integrated medical and cosmetic services aimed at improving your quality of life and boosting your self-confidence.',
  '[{"icon":"Check","ar":"رعاية طبية متخصصة","en":"Specialized medical care"},{"icon":"Check","ar":"تقنيات حديثة","en":"Modern techniques"},{"icon":"Check","ar":"متابعة متكاملة","en":"Comprehensive follow-up"},{"icon":"Check","ar":"حلول مصممة حسب الحالة","en":"Solutions tailored to each case"}]',
  '{"label_ar":"احجز موعد","label_en":"Book Appointment","url":"/appointment"}',
  '{"label_ar":"تواصل معنا","label_en":"Contact Us","url":"/contact"}',
  'right', 'center', 0.5, 1
)
on conflict do nothing;

-- ------------------------------------------------------------
-- PAGES
-- ------------------------------------------------------------
insert into public.pages (slug, type, title_ar, title_en, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en) values
('home','home','الرئيسية','Home','عيادات افتخار للخدمات العلاجية | خدمات طبية وتجميلية في عمّان','Eftekar Medical & Therapeutic Clinics | Medical & Cosmetic Services in Amman','عيادات افتخار للخدمات العلاجية في عمّان تقدم خدمات طبية وتجميلية متخصصة بإشراف أطباء مختصين وتقنيات حديثة، مع إمكانية حجز موعد والتواصل مع العيادة.','Eftekar Medical & Therapeutic Clinics in Amman provides specialized medical and cosmetic services with qualified medical professionals, modern technologies and convenient appointment booking.'),
('about','about','من نحن','About Us','من نحن | عيادات افتخار للخدمات العلاجية','About Eftekar Medical & Therapeutic Clinics','تعرف على عيادات افتخار للخدمات العلاجية ورؤيتنا ورسالتنا وفريقنا والخدمات الطبية والتجميلية التي نقدمها في عمّان.','Learn more about Eftekar Medical & Therapeutic Clinics, our mission, vision, team and specialized medical and cosmetic services in Amman.'),
('contact','contact','تواصل معنا','Contact Us','تواصل معنا | عيادات افتخار للخدمات العلاجية','Contact Eftekar Medical & Therapeutic Clinics','تواصل مع عيادات افتخار للخدمات العلاجية في عمّان عبر الهاتف أو البريد الإلكتروني أو نموذج التواصل.','Contact Eftekar Medical & Therapeutic Clinics in Amman by phone, email or the contact form.'),
('privacy-policy','legal','سياسة الخصوصية','Privacy Policy','سياسة الخصوصية | عيادات افتخار','Privacy Policy | Eftekar Clinics','سياسة الخصوصية لعيادات افتخار للخدمات العلاجية.','Privacy policy for Eftekar Medical & Therapeutic Clinics.'),
('terms','legal','الشروط والأحكام','Terms & Conditions','الشروط والأحكام | عيادات افتخار','Terms & Conditions | Eftekar Clinics','الشروط والأحكام الخاصة باستخدام موقع عيادات افتخار للخدمات العلاجية.','Terms and conditions for using the Eftekar Medical & Therapeutic Clinics website.'),
('medical-disclaimer','legal','إخلاء المسؤولية الطبية','Medical Disclaimer','إخلاء المسؤولية الطبية | عيادات افتخار','Medical Disclaimer | Eftekar Clinics','إخلاء المسؤولية الطبية الخاص بموقع عيادات افتخار للخدمات العلاجية.','Medical disclaimer for the Eftekar Medical & Therapeutic Clinics website.')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- LEGAL PAGE CONTENT
-- ------------------------------------------------------------
update public.pages set
  content_ar = 'نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. نقوم بجمع المعلومات التي تقدمها طوعًا (مثل الاسم ورقم الهاتف والبريد الإلكتروني) لغرض التواصل معك وتحديد المواعيد والرد على استفساراتك. لا نقوم بمشاركة بياناتك مع أطراف خارجية إلا عند الحاجة لتقديم الخدمة أو بموجب القانون. يمكنك التواصل معنا لطلب الاطلاع على بياناتك أو تعديلها أو حذفها.',
  content_en = 'We respect your privacy and are committed to protecting your personal data. We collect information you provide voluntarily (such as name, phone number and email) to contact you, schedule appointments and respond to your inquiries. We do not share your data with third parties except where necessary to provide the service or as required by law. You may contact us to request access to, correction of or deletion of your data.'
where slug = 'privacy-policy';

update public.pages set
  content_ar = 'باستخدامك لهذا الموقع فإنك توافق على هذه الشروط. المحتوى المنشور لأغراض إعلامية عامة ولا يغني عن الاستشارة الطبية. نحتفظ بحق تعديل المحتوى أو الخدمات في أي وقت. يتحمل المستخدم مسؤولية صحة البيانات التي يقدمها عند حجز المواعيد.',
  content_en = 'By using this website you agree to these terms. Published content is for general informational purposes and is not a substitute for medical consultation. We reserve the right to modify content or services at any time. Users are responsible for the accuracy of the information they provide when booking appointments.'
where slug = 'terms';

update public.pages set
  content_ar = 'المعلومات الواردة في هذا الموقع لأغراض إعلامية عامة فقط ولا تُعد بديلاً عن التشخيص أو الاستشارة أو العلاج الطبي. النتائج تختلف من حالة لأخرى، ويتم تحديد مدى ملاءمة أي إجراء بعد التقييم الطبي ومناقشة الخيارات والفوائد والمخاطر مع الطبيب المختص. لا نقدم أي وعود بضمان نتائج معينة. في حال وجود حالة طبية طارئة يرجى مراجعة أقرب جهة طبية.',
  content_en = 'The information on this website is for general informational purposes only and is not a substitute for medical diagnosis, consultation or treatment. Results vary by case, and the suitability of any procedure is determined after medical assessment and discussion of options, benefits and risks with the specialist. We do not make any promises of guaranteed results. In case of a medical emergency, please contact the nearest medical facility.'
where slug = 'medical-disclaimer';

-- ------------------------------------------------------------
-- HOME PAGE SECTIONS (Page Builder)
-- ------------------------------------------------------------
do $$
declare
  home_id uuid := (select id from public.pages where slug='home');
begin
  insert into public.page_sections (page_id, section_type, title_ar, title_en, subtitle_ar, subtitle_en, content, display_order) values
  (home_id, 'hero', null, null, null, null, '{}'::jsonb, 1),
  (home_id, 'statistics', null, null, null, null, '{}'::jsonb, 2),
  (home_id, 'introduction',
    'حيث تلتقي الخبرة الطبية بالنتائج الموثوقة',
    'Where Medical Expertise Meets Trusted Results',
    'رعاية طبية بمعايير عالمية مع عيادات افتخار',
    'World-class medical care with Eftekar Clinics',
    '{"ar":{"text":"نحن في عيادات افتخار للخدمات العلاجية نؤمن أن الرعاية الطبية ليست مجرد علاج، بل تجربة متكاملة تبدأ من التقييم الدقيق للحالة وتمتد إلى المتابعة والاهتمام بكل تفاصيل رحلة المريض. نقدم خدمات طبية وتجميلية متخصصة بإشراف أطباء مختصين، مع الاعتماد على تقنيات حديثة وبيئة طبية تهدف إلى توفير تجربة مريحة وآمنة.","features":[{"icon":"Stethoscope","title":"أطباء متخصصون","text":"نخبة من الأطباء والمختصين لتقديم رعاية مبنية على الخبرة والمعرفة الطبية."},{"icon":"Cpu","title":"تقنيات حديثة","text":"الاعتماد على أحدث التقنيات والأجهزة الطبية المتاحة وفق طبيعة كل خدمة."},{"icon":"HeartHandshake","title":"رعاية متكاملة","text":"اهتمام بالمريض من التقييم الأول وحتى المتابعة اللاحقة."},{"icon":"ShieldCheck","title":"تجربة مريحة","text":"بيئة طبية تهدف إلى توفير أعلى مستويات الراحة والخصوصية."}]},"en":{"text":"At Eftekar Clinics we believe medical care is not only treatment, but an integrated experience that begins with careful assessment and extends to follow-up and attention to every detail of the patient journey. We provide specialized medical and cosmetic services supervised by qualified doctors, using modern technologies and a medical environment aimed at a comfortable and safe experience.","features":[{"icon":"Stethoscope","title":"Specialized Doctors","text":"An elite team of doctors and specialists delivering care built on medical expertise and knowledge."},{"icon":"Cpu","title":"Modern Technologies","text":"Using the latest available technologies and medical equipment according to each service."},{"icon":"HeartHandshake","title":"Integrated Care","text":"Attention to the patient from the first assessment through follow-up."},{"icon":"ShieldCheck","title":"Comfortable Experience","text":"A medical environment aimed at the highest levels of comfort and privacy."}]}}'::jsonb, 3),
  (home_id, 'video_content',
    'شاهد المزيد عن خدماتنا',
    'See More About Our Services',
    null, null,
    '{"video":{"youtube_url":"","thumbnail":"","autoplay":false,"muted":true,"loop":false,"controls":true,"overlay":true,"modal":true},"bullets":[{"icon":"Check","ar":"فريق طبي متخصص","en":"Specialized medical team"},{"icon":"Check","ar":"بيئة طبية آمنة","en":"Safe medical environment"},{"icon":"Check","ar":"متابعة مستمرة","en":"Continuous follow-up"}],"cta":{"label_ar":"احجز موعد","label_en":"Book Appointment","url":"/appointment"}}'::jsonb, 4),
  (home_id, 'service_categories',
    'تخصصاتنا الطبية',
    'Our Medical Specialties',
    'خدمات طبية وتجميلية متكاملة',
    'Integrated medical and cosmetic services',
    '{}'::jsonb, 5),
  (home_id, 'promotional_slider', null, null, null, null, '{}'::jsonb, 7),
  (home_id, 'doctors',
    'كوادر طبية بخبرة استثنائية',
    'Medical Staff with Exceptional Expertise',
    'نخبة من الأطباء والمختصين لتقديم رعاية طبية متخصصة تراعي احتياجات كل حالة.',
    'An elite team of doctors and specialists delivering specialized medical care that respects each case.',
    '{}'::jsonb, 8),
  (home_id, 'testimonials',
    'آراء مرضانا',
    'What Our Patients Say',
    null, null, '{}'::jsonb, 9),
  (home_id, 'before_after', null, null, null, null, '{}'::jsonb, 10),
  (home_id, 'gallery', null, null, null, null, '{}'::jsonb, 11),
  (home_id, 'way_to_clinic',
    'طريقك إلينا',
    'Your Way to Us',
    'الوصول إلى عياداتنا أصبح أسهل',
    'Reaching our clinic is now easier',
    '{"ar":{"text":"شاهد الفيديو للتعرف على الطريق والوصول إلى العيادة بسهولة.","buttons":[{"label":"فتح الموقع على الخريطة","url":"/contact","icon":"MapPin"},{"label":"احجز موعد","url":"/appointment","icon":"Calendar"}]},"en":{"text":"Watch the video to learn the route and reach the clinic easily.","buttons":[{"label":"Open Location on Map","url":"/contact","icon":"MapPin"},{"label":"Book Appointment","url":"/appointment","icon":"Calendar"}]},"video":{"youtube_url":"","thumbnail":""}}'::jsonb, 12),
  (home_id, 'final_cta',
    'ابدأ رحلتك نحو صحة أفضل',
    'Start Your Journey to Better Health',
    'احجز موعدك اليوم واحصل على تقييم واستشارة تناسب احتياجاتك.',
    'Book your appointment today and get an assessment and consultation tailored to your needs.',
    '{"cta":{"label_ar":"احجز موعد","label_en":"Book Appointment","url":"/appointment"}}'::jsonb, 13)
  on conflict do nothing;
end $$;

-- ------------------------------------------------------------
-- ABOUT PAGE SECTIONS
-- ------------------------------------------------------------
do $$
declare
  about_id uuid := (select id from public.pages where slug='about');
begin
  insert into public.page_sections (page_id, section_type, title_ar, title_en, subtitle_ar, subtitle_en, content, display_order) values
  (about_id, 'introduction',
    'نصنع فرقًا حقيقيًا في حياتك الصحية',
    'We Make a Real Difference in Your Health',
    'تعرف على افتخار',
    'Get to know Eftekar',
    '{"ar":{"text":"عيادات افتخار للخدمات العلاجية هي وجهتك للحصول على رعاية طبية وتجميلية متخصصة، حيث نجمع بين الخبرة الطبية والتقنيات الحديثة والاهتمام بالمريض لتقديم تجربة متكاملة تبدأ من التقييم وتستمر خلال مراحل العلاج والمتابعة.","features":[{"icon":"Stethoscope","title":"أطباء ومختصون","text":"فريق طبي مختص"},{"icon":"Cpu","title":"تقنيات حديثة","text":"أحدث التقنيات الطبية"},{"icon":"HeartHandshake","title":"رعاية متكاملة","text":"اهتمام بالمريض"},{"icon":"ShieldCheck","title":"خصوصية واهتمام","text":"بيئة آمنة وخاصة"},{"icon":"Smile","title":"تجربة مريحة","text":"راحة المريض أولوية"}]},"en":{"text":"Eftekar Medical & Therapeutic Clinics is your destination for specialized medical and cosmetic care, combining medical expertise, modern technologies and patient attention to deliver an integrated experience from assessment through treatment and follow-up.","features":[{"icon":"Stethoscope","title":"Doctors & Specialists","text":"A specialized medical team"},{"icon":"Cpu","title":"Modern Technologies","text":"The latest medical technologies"},{"icon":"HeartHandshake","title":"Integrated Care","text":"Attention to the patient"},{"icon":"ShieldCheck","title":"Privacy & Attention","text":"A safe, private environment"},{"icon":"Smile","title":"Comfortable Experience","text":"Patient comfort is a priority"}]}}'::jsonb, 1),
  (about_id, 'text', 'رؤيتنا', 'Our Vision', null, null,
    '{"ar":{"text":"أن نكون من الوجهات الطبية الموثوقة في تقديم الخدمات العلاجية والتجميلية المتخصصة، مع الاستمرار في تطوير مستوى الرعاية والتقنيات والخدمات."},"en":{"text":"To be one of the trusted medical destinations for specialized therapeutic and cosmetic services, while continuing to develop the level of care, technologies and services."},"icon":"Target"}'::jsonb, 2),
  (about_id, 'text', 'رسالتنا', 'Our Mission', null, null,
    '{"ar":{"text":"تقديم رعاية طبية تضع المريض في مقدمة الاهتمام، وتجمع بين الخبرة الطبية والتكنولوجيا الحديثة والخصوصية والاهتمام الإنساني."},"en":{"text":"To provide medical care that puts the patient first, combining medical expertise, modern technology, privacy and human attention."},"icon":"HeartHandshake"}'::jsonb, 3)
  on conflict do nothing;
end $$;

-- ------------------------------------------------------------
-- CONTACT SETTINGS
-- ------------------------------------------------------------
insert into public.contact_settings (id, phone, whatsapp, email, address_ar, address_en, google_maps_url, working_hours, emergency_phone, secondary_phone)
values (1,
  '+962793736663',
  '+962793736663',
  'info@eftekhar-services.com',
  'الأردن – عمان – حي الخالدي الطبي – شارع نينوى – عمارة سر من رأى – الطابق الأول',
  'Jordan – Amman – Al-Khalidi Medical District – Nineveh Street – Sur Man Raa Building – First Floor',
  'https://maps.google.com/?q=Amman+Al+Khalidi+Medical+District',
  '[{"days_ar":"السبت – الخميس","days_en":"Saturday – Thursday","hours_ar":"9:00 صباحًا – 4:00 مساءً","hours_en":"9:00 AM – 4:00 PM"}]'::jsonb,
  null, null)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- SOCIAL LINKS
-- ------------------------------------------------------------
insert into public.social_links (platform, url, display_order, is_active) values
  ('Facebook', '', 1, false),
  ('Instagram', '', 2, false),
  ('TikTok', '', 3, false),
  ('YouTube', '', 4, false),
  ('WhatsApp', '', 5, false),
  ('Snapchat', '', 6, false),
  ('LinkedIn', '', 7, false),
  ('X', '', 8, false),
  ('Telegram', '', 9, false)
on conflict do nothing;

-- ------------------------------------------------------------
-- NAVIGATION
-- ------------------------------------------------------------
insert into public.navigation_items (label_ar, label_en, url, display_order) values
  ('الرئيسية','Home','/',1),
  ('من نحن','About Us','/about',2),
  ('الأطباء','Doctors','/doctors',3),
  ('الخدمات','Services','/services',4),
  ('تواصل معنا','Contact Us','/contact',5)
on conflict do nothing;

insert into public.navigation_items (label_ar, label_en, url, parent_id, display_order)
select 'معرض الفيديوهات','Videos','/videos', id, 1 from public.navigation_items where url = '/about'
on conflict do nothing;

insert into public.navigation_items (label_ar, label_en, url, parent_id, display_order)
select 'معرض الصور','Gallery','/gallery', id, 2 from public.navigation_items where url = '/about'
on conflict do nothing;

-- ------------------------------------------------------------
-- FOOTER SETTINGS
-- ------------------------------------------------------------
insert into public.footer_settings (id, about_ar, about_en, copyright_ar, copyright_en, columns)
values (1,
  'عيادات افتخار للخدمات العلاجية وجهتك للحصول على رعاية طبية وتجميلية متخصصة بإشراف أطباء مختصين وتقنيات حديثة.',
  'Eftekar Medical & Therapeutic Clinics is your destination for specialized medical and cosmetic care supervised by qualified doctors using modern technologies.',
  'جميع الحقوق محفوظة © {year} عيادات افتخار للخدمات العلاجية',
  'All rights reserved © {year} Eftekar Medical & Therapeutic Clinics',
  '[]'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- SITE SETTINGS
-- ------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('site_name_ar', '{"text":"عيادات افتخار للخدمات العلاجية"}'::jsonb),
  ('site_name_en', '{"text":"Eftekar Medical & Therapeutic Clinics"}'::jsonb),
  ('tagline_ar', '{"text":"استعد لحياة جديدة وثقة أكبر"}'::jsonb),
  ('tagline_en', '{"text":"Get Ready for a New Life and Greater Confidence"}'::jsonb),
  ('logo_url', '{"text":""}'::jsonb),
  ('header', '{"sticky":true,"style":"solid","cta_text_ar":"احجز موعد","cta_text_en":"Book Appointment","cta_url":"/appointment","show_phone":true,"show_lang_switcher":true,"auto_services_dropdown":true}'::jsonb),
  ('floating', '{"social_enabled":true,"appointment_enabled":true,"back_to_top_enabled":true,"appointment_text_ar":"احجز موعد","appointment_text_en":"Book Appointment"}'::jsonb),
  ('appointment', '{"enable_consent":true,"consent_text_ar":"أوافق على جمع بياناتي لغرض التواصل وتحديد الموعد.","consent_text_en":"I consent to the collection of my data for contact and scheduling purposes.","success_message_ar":"تم استلام طلبك بنجاح. سنتواصل معك قريبًا لتأكيد الموعد.","success_message_en":"Your request has been received. We will contact you shortly to confirm your appointment.","default_country":"JO"}'::jsonb),
  ('analytics', '{"ga4_enabled":false,"ga4_id":""}'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- SEO METADATA (route-level)
-- ------------------------------------------------------------
insert into public.seo_metadata (route, title_ar, title_en, description_ar, description_en, keywords_ar, keywords_en) values
  ('/', 'عيادات افتخار للخدمات العلاجية | خدمات طبية وتجميلية في عمّان','Eftekar Medical & Therapeutic Clinics | Medical & Cosmetic Services in Amman','عيادات افتخار للخدمات العلاجية في عمّان تقدم خدمات طبية وتجميلية متخصصة بإشراف أطباء مختصين وتقنيات حديثة، مع إمكانية حجز موعد والتواصل مع العيادة.','Eftekar Medical & Therapeutic Clinics in Amman provides specialized medical and cosmetic services with qualified medical professionals, modern technologies and convenient appointment booking.','عيادات افتخار, خدمات طبية, خدمات تجميلية, عمّان, الأردن','Eftekar Clinics, medical services, cosmetic services, Amman, Jordan'),
  ('/about', 'من نحن | عيادات افتخار للخدمات العلاجية','About Eftekar Medical & Therapeutic Clinics','تعرف على عيادات افتخار للخدمات العلاجية ورؤيتنا ورسالتنا وفريقنا والخدمات الطبية والتجميلية التي نقدمها في عمّان.','Learn more about Eftekar Medical & Therapeutic Clinics, our mission, vision, team and specialized medical and cosmetic services in Amman.','عيادات افتخار, من نحن, خدمات طبية, عمّان','Eftekar Clinics, about, medical services, Amman'),
  ('/services', 'الخدمات الطبية والتجميلية | عيادات افتخار','Medical & Cosmetic Services | Eftekar Clinics','اكتشف الخدمات الطبية والتجميلية في عيادات افتخار، بما في ذلك جراحة السمنة والتجميل وطب العيون وعلاجات الأسنان وخدمات علاج ضعف الانتصاب.','Explore specialized medical and cosmetic services at Eftekar Clinics, including bariatric surgery, plastic surgery, ophthalmology, dental care and erectile dysfunction treatments.','عيادات افتخار, خدمات طبية, خدمات تجميلية, عمّان','Eftekar Clinics, medical services, cosmetic services, Amman'),
  ('/doctors', 'الأطباء | عيادات افتخار للخدمات العلاجية','Doctors | Eftekar Medical & Therapeutic Clinics','تعرف على الأطباء والمختصين في عيادات افتخار للخدمات العلاجية في عمّان.','Meet the doctors and specialists at Eftekar Medical & Therapeutic Clinics in Amman.','عيادات افتخار, أطباء, عمّان','Eftekar Clinics, doctors, Amman'),
  ('/gallery', 'معرض الصور | عيادات افتخار','Gallery | Eftekar Clinics','شاهد معرض الصور الخاص بعيادات افتخار للخدمات العلاجية في عمّان.','View the gallery of Eftekar Medical & Therapeutic Clinics in Amman.','عيادات افتخار, معرض الصور, عمّان','Eftekar Clinics, gallery, Amman'),
  ('/videos', 'معرض الفيديوهات | عيادات افتخار','Videos | Eftekar Clinics','شاهد معرض الفيديوهات الخاص بعيادات افتخار للخدمات العلاجية في عمّان.','Watch the videos of Eftekar Medical & Therapeutic Clinics in Amman.','عيادات افتخار, فيديوهات, عمّان','Eftekar Clinics, videos, Amman'),
  ('/contact', 'تواصل معنا | عيادات افتخار للخدمات العلاجية','Contact Eftekar Medical & Therapeutic Clinics','تواصل مع عيادات افتخار للخدمات العلاجية في عمّان عبر الهاتف أو البريد الإلكتروني أو نموذج التواصل.','Contact Eftekar Medical & Therapeutic Clinics in Amman by phone, email or the contact form.','عيادات افتخار, تواصل معنا, عمّان','Eftekar Clinics, contact, Amman'),
  ('/appointment', 'حجز موعد | عيادات افتخار للخدمات العلاجية','Book Appointment | Eftekar Clinics','احجز موعدًا في عيادات افتخار للخدمات العلاجية في عمّان.','Book an appointment at Eftekar Medical & Therapeutic Clinics in Amman.','عيادات افتخار, حجز موعد, عمّان','Eftekar Clinics, appointment, Amman')
on conflict (route) do nothing;

-- ------------------------------------------------------------
-- TESTIMONIALS (demo only)
-- ------------------------------------------------------------
insert into public.testimonials (name_ar, name_en, rating, review_ar, review_en, source, is_demo, display_order) values
  ('مريض سابق','Former Patient',5,'تجربة مريحة وفريق محترم. التقييم كان دقيقًا والشرح واضح قبل اتخاذ أي قرار.','A comfortable experience and a respectful team. The assessment was careful and the explanation was clear before any decision.','manual',true,1)
on conflict do nothing;

-- ------------------------------------------------------------
-- GALLERY CATEGORIES (empty starter)
-- ------------------------------------------------------------
insert into public.gallery_categories (slug, name_ar, name_en, display_order) values
  ('general','عام','General',1),
  ('services','الخدمات','Services',2),
  ('before-after','قبل وبعد','Before & After',3)
on conflict (slug) do nothing;

insert into public.video_categories (slug, name_ar, name_en, display_order) values
  ('general','عام','General',1)
on conflict (slug) do nothing;
