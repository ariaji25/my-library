# My Library

A personal digital bookshelf to manage your book collection, track reading progress, save wishlists, and document reviews and favorite quotes.

## Features (MVP)

- **Dashboard** — stats, reading progress, genre chart, recent activity
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

## Deploy to Railway

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions.

Quick summary:

1. Create Railway project + PostgreSQL database
2. Set `DATABASE_URL=${{Postgres.DATABASE_URL}}` on the app service
3. Deploy from GitHub — first startup migrates and seeds automatically
4. Generate a public domain

## Project structure

```
src/app/(app)/     # Main pages (dashboard, library, books, wishlist, collections)
src/app/api/       # Health check for Railway
src/components/    # UI and feature components
src/lib/           # Prisma client, queries, server actions
prisma/            # Schema, migrations, seed
railway.json       # Railway build & deploy config
docker-compose.yml # Local Postgres
```

See [PRD.md](./PRD.md) for full product requirements.

## Roadmap (next)

- Currently reading spotlight, DNF status, series support
- Mood ratings, trope tags, reading journal
