-- ============================================================
-- Eftekar Clinics - Move videos & gallery under "About" nav
-- Safe: only re-parents items that currently have no parent.
-- ============================================================

update public.navigation_items
set parent_id = (select id from public.navigation_items where url = '/about' and parent_id is null limit 1)
where url in ('/videos', '/gallery') and parent_id is null;
