-- ============================================================
-- Eftekar Clinics - Link gallery/before-after items to services
-- Safe: additive column + index only.
-- ============================================================

alter table public.gallery_items
  add column if not exists service_id uuid references public.services(id) on delete set null;

create index if not exists idx_gallery_service on public.gallery_items(service_id);
