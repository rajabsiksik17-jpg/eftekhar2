# Deployment Guide — Hostinger

This project is a **Next.js 15** application (standalone build) that talks to **Supabase**. This guide covers deploying to Hostinger (VPS / Node.js) with your own domain, SSL, and DNS.

---

## 1. Build

The project uses `output: "standalone"` (set in `next.config.ts`), which produces a self-contained build suitable for Node.js hosting.

```bash
npm install
npm run build
```

The standalone output is generated in `.next/standalone/`.

---

## 2. Environment Variables

Set these in your Hostinger environment (never commit them):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_SECRET=<long-random-string>

SMTP_HOST=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_FROM="Eftekar Clinics <info@eftekhar-services.com>"
SMTP_ENCRYPTION=TLS

IMAP_HOST=...
IMAP_PORT=993
IMAP_USERNAME=...
IMAP_PASSWORD=...
IMAP_ENCRYPTION=SSL

NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

> For analytics reporting (dashboard charts), also provide the Google service-account credentials described in `.env.example`.

---

## 3. Supabase Setup (production)

1. Run `supabase/migrations/00001_init.sql` then `supabase/seed.sql` in the SQL Editor.
2. Create your admin user (see README) and confirm the email.
3. Configure **Authentication → URL Configuration**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`
4. (Optional) Set custom SMTP in **Supabase Auth** too, though this app sends its own OTP email via its own SMTP settings.
5. Storage bucket `media` is public and created by the migration.

---

## 4. Domain & SSL

1. Point your domain's DNS to Hostinger (A/AAAA records or nameservers).
2. In Hostinger, add the domain and enable **Let's Encrypt** SSL (free).
3. Force HTTPS.

---

## 5. Running on Hostinger

**Option A — Node.js App (VPS / CyberPanel / hPanel Node):**

```bash
cd .next/standalone
node server.js
```
Use a process manager (PM2) so it restarts automatically:
```bash
pm2 start server.js --name eftekar
pm2 save
```
Copy `.next/static` into the standalone folder if you serve static files separately (the standalone output already references `../.next/static` — serve the full `.next` folder as described in Next.js standalone docs, or use a reverse proxy to serve `.next/static`).

**Option B — Reverse proxy (Nginx):**
```nginx
server {
  listen 80;
  server_name your-domain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 6. Post-deploy checklist

- [ ] `NEXT_PUBLIC_SITE_URL` matches your live domain (affects canonical/hreflang/sitemap).
- [ ] SSL active and HTTPS forced.
- [ ] Admin login → OTP email arrives (SMTP configured).
- [ ] Test appointment + contact forms.
- [ ] Update `robots.txt`/sitemap verified at `/sitemap.xml`.
- [ ] Set up Google Search Console verification for your domain and connect the integration in Admin → التكاملات.

---

## 7. Backups

- **Database:** Supabase → Dashboard → Database → Backups (or `pg_dump` via the connection string).
- **Storage:** Supabase → Storage → `media` bucket (download or use `supabase storage` CLI).
- **Config:** keep a copy of your `.env` values in a password manager.
