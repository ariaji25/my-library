# Deploy My Library

Deployment uses the **Dockerfile** in this repo. Railway (or any Docker host) builds and runs that image — no Nixpacks build/start commands required.

## Prerequisites

- [Railway account](https://railway.com) or any host that runs Docker
- [Docker](https://docs.docker.com/get-docker/) (for local production-like runs)

---

## Railway (Dockerfile)

### 1. Create project + Postgres

1. [railway.com/new](https://railway.com/new) → **Deploy from GitHub** → select this repo  
2. **+ New** → **Database** → **PostgreSQL**

Railway detects `Dockerfile` automatically (`railway.json` sets `builder: DOCKERFILE`).

### 2. App service variables

On the **app** service (not Postgres):

| Name | Value |
|------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `NODE_ENV` | `production` |

Replace `Postgres` with your database service name if different.

### 3. Deploy settings (optional)

In **Settings → Deploy**, clear custom **Build** / **Start** / **Pre-deploy** commands so the Dockerfile and `CMD` control the app.

`railway.json` only sets the healthcheck path (`/api/health`). The image also defines a Docker `HEALTHCHECK`.

### 4. Deploy

Push to `main` or run:

```bash
railway up
```

### 5. What happens on container start

`CMD npm run start` → `scripts/startup.ts`:

1. Starts Next.js immediately (healthcheck can pass)
2. In the background: wait for Postgres → `prisma migrate deploy` → idempotent seed

Optional:

| Variable | Effect |
|----------|--------|
| `SEED_DATABASE=true` | Wipe all data, then seed |
| `SKIP_MIGRATE=true` | Skip migrations at startup |

### 6. Public URL

App service → **Settings → Networking** → **Generate domain**

---

## Local Docker (production image)

```bash
docker compose up --build
```

- Postgres: internal only  
- App: [http://localhost:3000](http://localhost:3000)  
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Build image only:

```bash
docker build -t my-library .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  my-library
```

---

## Local development (no Docker app)

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
| Railway still uses Nixpacks | Ensure `Dockerfile` exists; set builder to **Dockerfile** in service settings |
| Healthcheck fails | Confirm `DATABASE_URL` on app service; check logs for `[startup] Starting Next.js` |
| Build fails at `prisma generate` | Check Dockerfile build logs; schema must be valid |
| Empty library | Wait for `[startup] Database setup complete` in logs, or `railway run npm run db:seed` |
| `DATABASE_URL is missing` | Link Postgres variable on the **app** service |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Auto | Set by Railway / Docker (`3000` default) |
| `NODE_ENV` | Recommended | `production` |

See [.env.example](./.env.example).
