-- ============================================================
-- Eftekar Clinics - Trusted-device sessions + email status
-- Safe migration: additive columns only.
-- ============================================================

alter table public.sessions
  add column if not exists trust_token text;

alter table public.email_settings
  add column if not exists smtp_enabled boolean not null default false,
  add column if not exists imap_enabled boolean not null default false,
  add column if not exists smtp_status text,
  add column if not exists imap_status text,
  add column if not exists smtp_tested_at timestamptz,
  add column if not exists imap_tested_at timestamptz;
