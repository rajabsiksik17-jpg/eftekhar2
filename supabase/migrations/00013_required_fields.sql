-- ============================================================
-- Eftekar Clinics - Make required fields required
-- Appointment: date + email required
-- Contact: email + subject required
-- ============================================================

update public.form_fields set required = true
where name = 'email' and form_id = (select id from public.forms where key = 'appointment');

update public.form_fields set required = true
where name = 'preferred_date' and form_id = (select id from public.forms where key = 'appointment');

update public.form_fields set required = true
where name = 'email' and form_id = (select id from public.forms where key = 'contact');

update public.form_fields set required = true
where name = 'subject' and form_id = (select id from public.forms where key = 'contact');
