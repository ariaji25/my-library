# Arinda's Library


A personal digital bookshelf to manage your book collection, track reading progress, save wishlists, and document reviews and favorite quotes.

## Features (MVP)

- **Dashboard** — stats, monthly progress chart, reading progress, genre chart, recent activity
- **Library** — cover-first grid with search, filter, and sort
- **Book detail** — status, dates, rating, markdown review, quotes
- **Wishlist** — books to buy with priority and notes
- **Collections** — custom curated groups

## Tech stack

- Next.js 16 (App Router), React, TypeScript
- Tailwind CSS v4
- Prisma 7 + PostgreSQL (local via Docker, production on Railway)
- next-themes (light / dark)

## Getting started (local)

### Option A — Docker Postgres (matches Railway)

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Migrate, seed if empty, then start server |
| `npm run start:app` | Start Next.js only (skip migrate/seed) |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:seed` | Idempotent seed (add missing sample data) |
| `npm run db:seed -- --reset` | Wipe DB, then seed |
| `npm run db:reset` | Reset DB and re-seed |

## Deploy

**Vercel** (recommended), **GHCR Docker image** (GitHub Actions on `main`), or **Docker/Railway**. See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

```bash
# Vercel: import repo, add Postgres, set DATABASE_URL, deploy
# If you see inject-built-with-v0.mjs — delete NODE_OPTIONS in Vercel env vars

# Local production-like stack
docker compose up --build
```

## Project structure

```
src/app/(app)/     # Main pages (dashboard, library, books, wishlist, collections)
src/app/api/       # Health check for Railway
src/components/    # UI and feature components
src/lib/           # Prisma client, queries, server actions
prisma/            # Schema, migrations, seed
Dockerfile           # Production image (Railway / Docker)
docker-compose.yml           # Local dev: build app + Postgres (host port 5433)
docker-compose.example.yml   # Deploy: GHCR image + Postgres (see .env.compose.example)
railway.json         # Railway: use Dockerfile + healthcheck only
```

See [PRD.md](./PRD.md) for full product requirements.

## Roadmap (next)

- Currently reading spotlight, DNF status, series support
- Mood ratings, trope tags, reading journal
