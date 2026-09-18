# Tierytek Construction — Website & CMS

A production-ready, CMS-driven website for **Tierytek Construction** (steel construction, roofing, renovation, structural engineering and architectural design — Lagos, Nigeria).

- **Public website**: Home, About, Services (+ detail pages), Projects (+ case studies), Gallery, Insights (+ articles), Contact, Request a Quote, 404.
- **Admin dashboard** (`/admin`): Pages, Services, Projects, Gallery, Media Library, Insights, Enquiries, SEO, Branding, Business info, Social links, Users.
- **Backend**: Next.js (App Router) server actions + route handlers, PostgreSQL via Drizzle ORM, JWT session auth, local or S3-compatible media storage with automatic responsive WebP variants.

> **Content rule baked into the build:** nothing is invented. If information (projects, statistics, testimonials, certifications) has not been supplied, the website shows a professional empty state or the section is hidden until the owner adds it from the CMS.

---

## 1. Project structure

```
src/
  app/
    (site)/              Public website (layout with header/footer)
      page.tsx           Home
      about/ services/ projects/ gallery/ insights/ contact/ request-a-quote/
    admin/
      login/             Sign-in + first-run administrator setup
      (cms)/             Protected admin area (dashboard, content, settings)
    api/
      admin/media        Image upload + media listing (auth required)
      media/file/[...key] Serves uploaded files (enquiry attachments are private)
      enquiries          Public form endpoint (validation, honeypot, rate limit)
      health             Health check
    sitemap.ts robots.ts manifest.ts not-found.tsx error.tsx
  components/
    site/                Public UI (header, footer, gallery + lightbox, forms, rich text…)
    admin/               Admin UI (shell, forms, media picker…)
  db/
    schema.ts            Database tables (Drizzle)
    seed.ts              Idempotent seed (first admin, page copy, services, legacy news drafts)
    index.ts             Database client
  lib/
    auth.ts session.ts   Authentication (bcrypt passwords, signed httpOnly cookie sessions)
    storage.ts images.ts Media storage adapter + image processing (sharp)
    settings.ts          Branding / business / social / SEO settings
    page-fields.ts       Editable fields for each public page
    queries.ts seo.ts    Data access + metadata/JSON-LD helpers
  proxy.ts               Route protection for /admin and /api/admin
```

## 2. Requirements

- Node.js 20+ (22 recommended)
- PostgreSQL 14+

## 3. Installation (local development)

```bash
npm install
cp .env.example .env          # then edit the values (see section 4)
npm run db:push               # creates the database tables
npm run db:seed               # first admin + default content (safe to re-run)
npm run dev                   # http://localhost:3000
```

Admin: <http://localhost:3000/admin/login>

## 4. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes (prod) | Long random string used to sign admin sessions |
| `SITE_URL` | yes (prod) | Public URL, e.g. `https://www.tierytek.com` — used for canonical URLs, sitemap, Open Graph |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run only | Creates the first administrator when the users table is empty |
| `UPLOAD_DIR` | optional | Folder for uploads when using local storage (default `./uploads`) |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | optional | Enables cloud storage (see section 6) |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Never commit `.env`. `.env.example` documents every variable.

## 5. Database setup

Any PostgreSQL works: local Postgres, **Supabase**, **Neon**, **Railway**, **Render**.

1. Create a database and copy its connection string into `DATABASE_URL`.
2. Run `npm run db:push` to create the tables from `src/db/schema.ts`.
3. Run `npm run db:seed` (or simply open the site — the seed also runs automatically on first start).

Tables: `users`, `media`, `settings`, `pages`, `services`, `projects`, `project_services`, `gallery_items`, `insights`, `enquiries`.

## 6. Media storage

**Default — local disk.** Files are written to `UPLOAD_DIR` and served from `/api/media/file/...`. Fine for a VPS or a server with persistent disk. **Not suitable for Vercel** (its filesystem is read-only/ephemeral).

**Cloud — S3-compatible.** Set `S3_BUCKET` and the related variables. Works with:

- **Cloudflare R2** (recommended: free egress) — `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_PUBLIC_URL` = your R2 public bucket URL or custom domain.
- **Supabase Storage** — use the bucket's S3 endpoint and access keys (Project settings → Storage → S3), `S3_PUBLIC_URL=https://<project>.supabase.co/storage/v1/object/public/<bucket>`.
- AWS S3, DigitalOcean Spaces, MinIO.

Every image upload is validated (JPG/PNG/WebP/AVIF/GIF, ≤ 15 MB), auto-rotated and converted into `thumb` (640px), `medium` (1280px) and `large` (2000px) WebP variants. The public site uses `srcset` + lazy loading, so full-resolution originals are never sent to visitors. Enquiry attachments are stored under a private prefix and only served to signed-in admins.

## 7. Authentication

- Passwords are hashed with bcrypt (cost 12). Sessions are signed JWTs in an `httpOnly`, `SameSite=Lax` cookie (7 days).
- `/admin/*` and `/api/admin/*` are protected by `src/proxy.ts`; every server action re-checks authorisation.
- Roles: **admin** (everything) and **editor** (content + enquiries, no settings/users).
- Login is throttled after repeated failures; forms are protected with validation, a honeypot and per-IP rate limiting.

### Creating the first admin

Either set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first start, **or** open `/admin/login` on a fresh database — it shows a one-time "Create the first administrator" form.

### Resetting a password

- Any administrator: **Admin → Users → Reset password**.
- Locked out completely? Run in `psql`:
  ```sql
  -- generate a hash first: node -e "console.log(require('bcryptjs').hashSync('NewPassword123!', 12))"
  update users set password_hash = '<hash>' where email = 'you@example.com';
  ```

## 8. Deployment

Recommended architecture:

| Layer | Recommended | Alternatives |
| --- | --- | --- |
| App hosting | **Vercel** | Railway, Render, a VPS with `npm run build && npm start` |
| Database | **Supabase Postgres** or **Neon** | Railway Postgres, RDS |
| Media storage | **Cloudflare R2** | Supabase Storage, S3 |

### Vercel steps

1. Push the repository to GitHub.
2. Import the project in Vercel (framework: Next.js — no special settings).
3. Add the environment variables from section 4 (`DATABASE_URL`, `AUTH_SECRET`, `SITE_URL`, S3 variables, and `ADMIN_EMAIL`/`ADMIN_PASSWORD` for the first deploy).
4. Deploy. On the first request the seed creates the admin user and default content.
5. Remove `ADMIN_EMAIL`/`ADMIN_PASSWORD` after signing in (optional but tidy).

GitHub Pages (the old host) cannot run this application — it only serves static files.

## 9. Domain connection

1. In Vercel → Project → Settings → Domains, add `tierytek.com` and `www.tierytek.com`.
2. At the domain registrar, add the DNS records Vercel shows (an `A` record for the apex and a `CNAME` for `www`).
3. Set `SITE_URL` to the final `https://` address and redeploy.

## 10. SEO setup

- Every page has a unique title, meta description, canonical URL, Open Graph and Twitter metadata.
- `/sitemap.xml` and `/robots.txt` are generated from the database automatically.
- Structured data: Organization/GeneralContractor, WebSite, Service, Article and BreadcrumbList — populated only from real settings (no fake ratings or reviews).
- Per-page SEO fields live on each Page, Service, Project and Article in the admin. Site-wide defaults: **Admin → SEO**.

### Google Search Console

1. Deploy with the correct `SITE_URL`.
2. In Search Console choose "URL prefix", paste the site URL, pick **HTML tag** verification and copy the `content` value.
3. Paste it into **Admin → SEO → Google Search Console verification code**, save, then click *Verify*.
4. Submit `https://<your-domain>/sitemap.xml` under *Sitemaps*.

### Google Business Profile / local SEO

Keep the business name, address and phone in **Admin → Settings → Business** identical to the Google Business Profile listing. Add the Google Maps embed URL to show a map on the Contact page.

## 11. Using the CMS

Sign in at `/admin/login`.

| Area | What you can do |
| --- | --- |
| **Dashboard** | Live counts (published/draft content, new enquiries), recent enquiries and uploads |
| **Pages** | Edit headings, copy, bullet lists and images of Home, About, Services, Projects, Gallery, Insights, Contact, Request a Quote (+ per-page SEO) |
| **Services** | Add / edit / publish / unpublish / delete / reorder services; image, capabilities, detailed description, related projects, SEO |
| **Projects** | Detailed case studies: client, location, category, year, overview, scope, challenge, solution, results, cover + multiple images, video link, related services, featured flag, SEO |
| **Gallery** | Visual board of completed work (separate from Projects): multi-image upload, title, client, project name, location, category, year, caption, description, optional link to a project, featured, ordering |
| **Media Library** | Drag-and-drop uploads, search, alt text and captions, "used in" tracking, safe delete |
| **Insights** | Articles/news with excerpt, body, featured image, category, tags, author, date, SEO, publish/unpublish |
| **Enquiries** | View quote requests and contact messages, attachments, change status (New → Contacted → In Progress → Quoted → Won → Closed), internal notes, delete |
| **SEO** | Site name, title template, default description, indexing toggle, Search Console code |
| **Branding** | Official logo (light/dark), favicon/site icon, default social sharing image |
| **Business** | Company names, address, phones, WhatsApp, email, hours, service areas, map, footer text, copyright name |
| **Social** | Facebook, Instagram, LinkedIn, X, YouTube, TikTok |
| **Users** | Add admins/editors, change roles, reset passwords |

**Formatting in text areas:** `## Heading`, `### Sub-heading`, `- bullet`, `1. numbered`, `**bold**`, `_italic_`, `[link text](https://…)`, blank line between paragraphs. Content is rendered safely (no raw HTML).

**Previewing drafts:** while signed in, open the "Preview" link next to any unpublished service, project or article — visitors cannot see drafts.

### Gallery workflow

1. **Admin → Gallery → Add gallery item**
2. Drag & drop one or many photos (or pick from the Media Library) — you see upload progress and can reorder/remove before saving.
3. Enter title, category, client, project name, location, year, caption, description.
4. Optionally link to a Project and tick **Featured** (shows on the homepage).
5. Tick **Published** → the item appears on `/gallery` immediately.
6. Add descriptive **alt text** for each photo in the Media Library (items missing alt text are flagged).

### Project workflow

Add project → fill the story fields → upload cover + images → link services → **Publish** (requires at least one image) → optionally **Feature** for the homepage.

## 12. Items to confirm (found on the previous website)

These were inconsistent on the old site and were **not guessed**. Update them in **Admin → Settings → Business**:

- Official company name: “Tierytek Construction”, “Tierytek Construction Steel Company” or “Tierytek Constructions Steel Company”.
- Phone numbers `+234 3916 9697` and `+234 5299 8888` (shorter than a standard Nigerian number).
- Business hours, WhatsApp number, social media links (none were listed).
- The three legacy news items were imported as **drafts** — verify and expand before publishing.
- Upload the official logo in **Admin → Settings → Branding** (a plain text wordmark is shown until then).

## 13. Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / start |
| `npm run db:push` | Apply schema to the database |
| `npm run db:seed` | Seed defaults (idempotent) |
| `npm run db:studio` | Browse the database with Drizzle Studio |
| `npm run typecheck` / `npm run lint` | Type-check / lint |

---

Built by GEXANOVA Innovation Limited.
