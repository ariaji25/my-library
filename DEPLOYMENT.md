# Deploy My Library

## Vercel (recommended)

### Fix: `inject-built-with-v0.mjs` error

This error is **not from this repo**. It happens when the Vercel project was linked to **v0** and injects a broken `NODE_OPTIONS` variable.

**Fix in Vercel Dashboard:**

1. Open your project → **Settings** → **Environment Variables**
2. Find **`NODE_OPTIONS`** (if present) — it may look like:
   ```
   --import /vercel/path0/.v0/inject-built-with-v0.mjs
   ```
3. **Delete** that variable (all environments)
4. **Redeploy** with “Clear build cache” enabled

Also check **Settings → General** and disconnect / remove v0 integration if the project was created from v0.dev but you deploy this Git repo instead.

---

### 1. Create Vercel project

1. [vercel.com/new](https://vercel.com/new) → import this Git repository
2. Framework: **Next.js** (auto-detected)
3. Root directory: `.` (repo root)

Build settings come from `vercel.json`:

- **Install:** `npm install`
- **Build:** `npm run vercel-build` (`prisma generate` → `migrate deploy` → `next build`)

### 2. Add PostgreSQL

Use one of:

- **Vercel Postgres** — Storage → Create Database → Postgres
- **Neon** — [neon.tech](https://neon.tech) → connect integration to Vercel
- **Supabase** — connection string in env vars

### 3. Environment variables

On the **project** (all environments you deploy):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Postgres connection string (pooled URL if provider offers one) |
| `NODE_ENV` | `production` |

**Do not set** `NODE_OPTIONS` unless you know you need it.

`DATABASE_URL` must be available at **build time** too (for `prisma migrate deploy` in `vercel-build`).

### 4. Deploy

Push to `main` or click **Deploy**. After the first successful deploy, seed sample data once:

```bash
npx vercel env pull .env.local
npx tsx prisma/seed.ts
```

Or from Vercel dashboard → project → **⋯** → **Open in Terminal** → `npm run db:seed`

### 5. Optional env vars

| Variable | Effect |
|----------|--------|
| `SEED_DATABASE=true` | Not used on Vercel build; use `db:seed` manually |
| `SKIP_MIGRATE=true` | Change `vercel-build` to `prisma generate && next build` if migrations run elsewhere |

---

## Docker / Railway

See previous sections below for Docker Compose and Railway Dockerfile deploy.

### Railway

- Uses `Dockerfile` + `railway.json`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Start command: `npm run start` (custom startup script)

### Local Docker

```bash
docker compose up --build
```

---

## Local development

```bash
docker compose up -d postgres
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `inject-built-with-v0.mjs` | Remove `NODE_OPTIONS` from Vercel env (see above) |
| Build fails on `migrate deploy` | Set `DATABASE_URL` for Production + Preview; or use Neon/Vercel Postgres integration |
| `DATABASE_URL` at runtime | Same variable on project; redeploy after adding |
| Empty library after deploy | Run `npm run db:seed` once |
| Prisma client not found | Build runs `prisma generate`; clear cache and redeploy |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL (build + runtime) |
| `NODE_ENV` | Recommended | `production` on Vercel |

See [.env.example](./.env.example).
