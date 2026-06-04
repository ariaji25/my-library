# Deploy My Library to Railway

## Prerequisites

- [Railway account](https://railway.com)
- GitHub repo (recommended) or [Railway CLI](https://docs.railway.com/develop/cli)

## 1. Create a Railway project

1. Go to [railway.com/new](https://railway.com/new)
2. **Deploy from GitHub repo** → select this repository  
   — or —  
   **Empty project** → `railway link` → `railway up` from this folder

## 2. Add PostgreSQL

1. In your project, click **+ New** → **Database** → **PostgreSQL**
2. Wait until the database is running

## 3. Connect the app to Postgres

1. Open your **Next.js / app service** (not the database)
2. Go to **Variables**
3. Add a reference variable:

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |

   Replace `Postgres` with your database service name if different.

4. Optional:

   | Name | Value |
   |------|--------|
   | `NODE_ENV` | `production` |

Railway sets `PORT` automatically — the app listens on `0.0.0.0`.

## 4. Deploy settings (already in repo)

This repo includes `railway.json`:

- **Build:** `npm run build` (runs `prisma generate` + Next.js build)
- **Pre-deploy:** `npx prisma migrate deploy` (runs before the container starts)
- **Start:** `npm run start` — retries migrations if needed, starts Next.js, then seeds in the background
- **Health check:** `GET /api/health` (300s timeout)

You can confirm these under **Settings → Deploy** in the Railway dashboard.

**Required variable on the app service:**

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

If healthchecks fail, `DATABASE_URL` is usually missing or on the wrong service.

## 5. Deploy

Push to your connected branch, or run:

```bash
railway up
```

First deploy will:

1. Install dependencies
2. Generate Prisma client
3. Build Next.js
4. On start: migrate → idempotent seed → serve the app

## 6. Seed behavior (idempotent)

Each sample record uses a stable `seed-*` ID. Running seed again only **adds what’s missing** — no duplicates, and your own books are untouched.

| Situation | What happens |
|-----------|----------------|
| First deploy (empty DB) | All sample books, quotes, collections, wishlist are created |
| Later restarts / redeploys | Migrate runs; seed skips existing `seed-*` rows |
| Force reset + seed | Set `SEED_DATABASE=true` (⚠️ wipes **all** data, then re-seeds) |

Manual idempotent seed:

```bash
railway run npm run db:seed
```

Wipe everything then seed:

```bash
railway run npm run db:seed -- --reset
```

## 7. Public URL

1. Open the app service → **Settings → Networking**
2. Click **Generate domain** (e.g. `my-library-production.up.railway.app`)

## Local development (match production)

```bash
docker compose up -d
cp .env.example .env
# Edit .env — use the postgresql URL from .env.example
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `postinstall` runs; check build logs for `prisma generate` |
| Healthcheck `service unavailable` | Set `DATABASE_URL` on the **app** service; redeploy after linking Postgres |
| `Can't reach database` on migrate | Postgres still starting — startup retries 12×; check Postgres plugin is running |
| App crashes on start | Deploy logs → look for `[startup] Fatal` or missing `DATABASE_URL` |
| Empty library after deploy | Wait for background seed in logs, or `railway run npm run db:seed` |
| Duplicate migrate | Set `SKIP_MIGRATE=true` on app if pre-deploy already migrates |
| Health check fails | Wait for cold start; path is `/api/health` |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (from Railway Postgres) |
| `PORT` | Auto | Set by Railway |
| `NODE_ENV` | Recommended | `production` |

See [.env.example](./.env.example) for local values.
