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
- **Start:** `npm run start` — on every boot this will:
  1. Run `prisma migrate deploy`
  2. Run an **idempotent seed** (creates missing sample data only; never duplicates)
  3. Start Next.js
- **Health check:** `GET /api/health` (timeout 180s to allow migrate + seed on cold start)

You can confirm these under **Settings → Deploy** in the Railway dashboard. Remove any manual pre-deploy migrate command if you added one earlier — startup handles it.

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
| `Can't reach database` on migrate | Confirm `DATABASE_URL` references Postgres; pre-deploy runs with private network |
| App crashes on start | Check logs; verify `DATABASE_URL` is set on the **app** service |
| Empty library after deploy | Check startup logs; DB may still be connecting. Or run `npm run db:seed` |
| Startup slow | Normal on first boot (migrate + seed); health check allows 180s |
| Health check fails | Wait for cold start; path is `/api/health` |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (from Railway Postgres) |
| `PORT` | Auto | Set by Railway |
| `NODE_ENV` | Recommended | `production` |

See [.env.example](./.env.example) for local values.
