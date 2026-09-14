# عيادات افتخار للخدمات العلاجية
## Eftekar Medical & Therapeutic Clinics

A production-ready, fully multilingual (Arabic RTL / English LTR) medical platform with a complete CMS/Admin dashboard — built with **Next.js (App Router)** + **Supabase**.

The website is fully database-driven. Every visible element — text, images, services, doctors, sections, navigation, footer, contact details, SEO — is managed from the Admin Dashboard without touching source code.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Server Components, Server Actions, API Route Handlers |
| Database | Supabase PostgreSQL (relational, FKs, indexes, RLS) |
| Storage | Supabase Storage |
| Auth | Supabase Auth + OTP (two-step login) + RBAC |
| Validation | Zod |
| Email | Nodemailer (SMTP) + IMAP connection testing |
| Charts | Recharts |
| Icons | Lucide React |

---

## Features

- **Multilingual** — Arabic (default, RTL) and English (LTR) with independent content and SEO per language.
- **Dynamic CMS** — pages, homepage sections (reorder/add/duplicate/disable), services, categories, doctors, gallery, before/after, videos, testimonials, statistics, hero slides, navigation, footer, contact info, social links, SEO metadata.
- **Page builder** — the homepage (and other pages) are composed of reorderable sections.
- **Service architecture** — 5 categories, dynamic nested routes `/services/[category]/[service]`, per-service content blocks and FAQ.
- **Appointment system** — international phone input (Jordan default), auto-preselect of category/service, consent.
- **Doctors & staff** — distinct types (doctor / consultant / staff / management / other).
- **Before/After** — draggable comparison slider with touch support.
- **Video system** — YouTube embeds (privacy-enhanced), modal playback.
- **Admin authentication** — email + password, then OTP to verified email on every new session.
- **RBAC** — 9 roles, granular permissions, enforced server-side (not just hidden UI).
- **Security** — RLS on all tables, service-role server-side operations, rate limiting, brute-force protection, session management (view/revoke/logout-all), audit logs, encrypted secrets.
- **SEO** — sitemap.xml, robots.txt, canonical, hreflang, OpenGraph, Twitter cards, Schema.org (BreadcrumbList, MedicalClinic, FAQPage-ready).
- **Integrations** — Google Analytics 4, Google Search Console, SMTP/IMAP with connection testing.

---

## Project Structure

```
eftekar-clinics/
├── supabase/
│   ├── migrations/00001_init.sql      # full schema + RLS + indexes + storage
│   └── seed.sql                       # initial Arabic/English content
├── src/
│   ├── app/
│   │   ├── [lang]/                    # public site (ar/en)
│   │   ├── admin/                     # admin dashboard
│   │   ├── api/                       # API route handlers
│   │   ├── sitemap.ts / robots.ts
│   │   └── globals.css
│   ├── components/                    # UI + sections + admin components
│   └── lib/                           # supabase clients, data, auth, seo, i18n...
├── .env.example
├── README.md
└── DEPLOYMENT.md
```

---

## Getting Started

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only!)

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in the Supabase values and set a strong `ADMIN_SECRET`.

### 3. Run migrations + seed
Using the Supabase SQL Editor, run in order:
1. `supabase/migrations/00001_init.sql`
2. `supabase/seed.sql`

(Or use the Supabase CLI: `supabase db push` then run `seed.sql`.)

### 4. Create your first admin user
In Supabase **Authentication → Users**, create a user with your email + password and confirm the email.
Then in the **SQL Editor**:
```sql
insert into public.profiles (id, email, full_name, is_super_admin, is_active)
values ('<auth-user-id>', 'you@example.com', 'Super Admin', true, true);
```
(The `<auth-user-id>` is the UUID from the Auth user you created.)

### 5. Configure SMTP (required for login OTP)
Admin OTP codes are emailed to your login address. Configure SMTP in **Admin → البريد الإلكتروني** (or via the `email_settings` table), or set the `SMTP_*` env vars and use them through the dashboard. Login OTP cannot be delivered without a working SMTP.

### 6. Run
```bash
npm install
npm run dev
```

- Public site: `http://localhost:3000` (redirects to `/ar`)
- Admin: `http://localhost:3000/admin`

---

## Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run start       # serve production build
npm run typecheck   # tsc --noEmit
```

---

## Security Notes

- The service-role key is **never** exposed to the browser; all privileged operations happen server-side.
- RLS is enabled on every table; public tables expose only `is_active = true` rows.
- Admin API endpoints verify authentication + OTP-verified session + role/permission on **every** request.
- SMTP/IMAP passwords and Search Console private keys are stored encrypted (AES-256-GCM).
- Audit logs record logins, content changes, role changes, media uploads, and more — never passwords or OTP values.

---

## Medical Content Policy

This is a medical website. Content uses responsible, non-guaranteeing language ("بحسب الحالة", "بعد التقييم الطبي"). No fabricated Google reviews — demo testimonials are explicitly marked. A medical disclaimer page is included and editable from the admin.
