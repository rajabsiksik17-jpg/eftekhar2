-- ============================================================
-- Eftekar Clinics - Form Builder
-- Safe migration: additive tables only.
-- ============================================================

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_ar text,
  name_en text,
  is_active boolean not null default true,
  submit_button_ar text,
  submit_button_en text,
  success_message_ar text,
  success_message_en text,
  error_message_ar text,
  error_message_en text,
  notify_email text,
  notify_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  field_type text not null default 'text',
  name text not null,
  label_ar text,
  label_en text,
  placeholder_ar text,
  placeholder_en text,
  help_text_ar text,
  help_text_en text,
  required boolean not null default false,
  validation text,
  default_value text,
  options jsonb not null default '[]'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_key text not null,
  data jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_form_fields_form on public.form_fields(form_id);
create index if not exists idx_form_submissions_key on public.form_submissions(form_key);
create index if not exists idx_form_submissions_created on public.form_submissions(created_at desc);

-- RLS
alter table public.forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.form_submissions enable row level security;

create policy "public select forms" on public.forms for select using (is_active = true);
create policy "public select form_fields" on public.form_fields for select using (is_active = true);

-- Submissions are written server-side only (service role); no public access.

-- Storage bucket for public form file uploads (limited).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "public upload submissions" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = 'submissions');

-- ============================================================
-- Seed default forms (contact + appointment)
-- ============================================================
insert into public.forms (key, name_ar, name_en, submit_button_ar, submit_button_en, success_message_ar, success_message_en, notify_enabled) values
  ('contact', 'نموذج التواصل', 'Contact Form', 'إرسال', 'Send', 'تم إرسال رسالتك بنجاح.', 'Your message has been sent successfully.', true),
  ('appointment', 'نموذج حجز الموعد', 'Appointment Form', 'إرسال الطلب', 'Submit Request', 'تم استلام طلبك بنجاح. سنتواصل معك قريبًا.', 'Your request has been received. We will contact you shortly.', true)
on conflict (key) do nothing;

do $$
declare
  contact_id uuid := (select id from public.forms where key='contact');
  appt_id uuid := (select id from public.forms where key='appointment');
begin
  if contact_id is not null and not exists (select 1 from public.form_fields where form_id=contact_id) then
    insert into public.form_fields (form_id, field_type, name, label_ar, label_en, placeholder_ar, placeholder_en, required, validation, display_order) values
      (contact_id,'text','name','الاسم الكامل','Full Name','اسمك','Your name',true,'min:2',1),
      (contact_id,'phone','phone','رقم الهاتف','Phone Number','رقم هاتفك','Your phone',false,null,2),
      (contact_id,'email','email','البريد الإلكتروني','Email','بريدك الإلكتروني','Your email',false,'email',3),
      (contact_id,'text','subject','الموضوع','Subject','موضوع الرسالة','Subject',false,'max:200',4),
      (contact_id,'textarea','message','رسالتك','Your Message','اكتب رسالتك هنا','Write your message',true,'min:5',5);
  end if;

  if appt_id is not null and not exists (select 1 from public.form_fields where form_id=appt_id) then
    insert into public.form_fields (form_id, field_type, name, label_ar, label_en, placeholder_ar, placeholder_en, required, validation, display_order) values
      (appt_id,'text','name','الاسم الكامل','Full Name','اسمك','Your name',true,'min:2',1),
      (appt_id,'phone','phone','رقم الهاتف','Phone Number','رقم هاتفك','Your phone',true,null,2),
      (appt_id,'email','email','البريد الإلكتروني','Email','بريدك الإلكتروني','Your email',false,'email',3),
      (appt_id,'categories','category','تصنيف الخدمة','Service Category',null,null,false,null,4),
      (appt_id,'services','service','الخدمة','Service',null,null,false,null,5),
      (appt_id,'doctors','doctor','الطبيب','Doctor',null,null,false,null,6),
      (appt_id,'date','preferred_date','التاريخ المفضل','Preferred Date',null,null,false,null,7),
      (appt_id,'time','preferred_time','الوقت المفضل','Preferred Time',null,null,false,null,8),
      (appt_id,'textarea','message','رسالتك','Your Message','تفاصيل إضافية','Additional details',false,null,9),
      (appt_id,'consent','consent','الموافقة','Consent',null,null,true,null,10);
  end if;
end $$;
