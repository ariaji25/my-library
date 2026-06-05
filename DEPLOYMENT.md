# Deploy Arinda's Library

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

### GitHub Container Registry (GHCR)

On every push to `main`, [`.github/workflows/docker.yml`](./.github/workflows/docker.yml) builds the image and pushes to:

```text
ghcr.io/<owner>/<repo>:latest
ghcr.io/<owner>/<repo>:<git-sha>
```

Tagged releases (`v1.0.0`, etc.) also get semver tags. Pull requests only **build** the image (no push).

**Pull and run** (replace owner/repo with yours, e.g. `ghcr.io/apurnama/my-library`):

```bash
docker pull ghcr.io/<owner>/<repo>:latest
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  ghcr.io/<owner>/<repo>:latest
```

For a **private** repo, log in first:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
```

Then grant the token `read:packages`. To make the image public: GitHub → **Packages** → your package → **Package settings** → **Change visibility**.

Migrations run at container start via `npm run start` (see `scripts/startup.ts`). Ensure `DATABASE_URL` points at a reachable Postgres instance.

### Docker Compose (app + Postgres)

[`docker-compose.example.yml`](./docker-compose.example.yml) runs the published image with a bundled Postgres database:

```bash
cp docker-compose.example.yml docker-compose.prod.yml
cp .env.compose.example .env
# Edit .env: POSTGRES_PASSWORD, APP_IMAGE (ghcr.io/<owner>/<repo>:latest)

docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Open http://localhost:3000 (or your `APP_PORT`). Postgres stays on the internal Docker network only.

Uploaded book covers are stored under `public/uploads/covers/` and persisted via the `cover_uploads` Docker volume. On **Vercel**, the filesystem is ephemeral — use cover **URLs** there, or deploy with Docker/Railway for file uploads.

**Build from source** instead of GHCR: uncomment the `build:` block under `app` in the compose file and set `APP_IMAGE=` empty, or use the repo’s [`docker-compose.yml`](./docker-compose.yml):

```bash
docker compose up --build
```

### Railway

- Uses `Dockerfile` + `railway.json`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Do **not** override the start command — use the Dockerfile `CMD` (runs `scripts/startup.ts`)

### SwiftWave

Deploy from **Git** (uses this repo’s `Dockerfile`) or pull the **GHCR** image (`ghcr.io/<owner>/<repo>:latest`).

**Start command:** leave empty so Docker uses the image `CMD`. If you set a custom command, do **not** use `npm run start` — npm turns SIGTERM into `npm error signal SIGTERM` even when shutdown is normal. Use the Dockerfile default or:

```text
node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json scripts/startup.ts
```

**Environment variables** (SwiftWave → Environment Variables):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres URL (required) |
| `DIRECT_DATABASE_URL` | Supabase: direct port **5432** for migrations at startup |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Same value as Docker **build** arg (see below) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional login |
| `PORT` | Usually `3000` (SwiftWave may inject this) |

**GHCR builds:** add `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to the GitHub **Production** environment (`openssl rand -base64 32`). The Docker workflow passes it at **build** time and bakes it into the image for **runtime** (Next.js generates a new random key in Docker without it). Optionally set the same value in SwiftWave env vars to override without rebuilding.

**Custom health check** (Deployment Configuration → Custom Health Check):

| Field | Suggested value |
|-------|-----------------|
| Test command | `node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"` |
| Start period | `120` |
| Interval | `30` |
| Timeout | `10` |
| Retries | `3` |

**Memory:** reserve at least **512 MB** (Next.js + Prisma migrations at startup).

**SIGTERM in logs after “Database setup complete”:** often a **normal** redeploy (old container stopped). If the **new** instance stays healthy and `/api/health` returns 200, you can ignore it. If instances keep restarting, check health check start period and that the start command is not `npm run start`.

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
| `P1000` auth failed on `localhost:5432` | Another Postgres may own port 5432; use `5433` in `.env` and `docker compose up -d postgres` (this repo maps `5433:5432`) |
| `db:migrate` hangs or never finishes | `.env` points at **Supabase transaction pooler** (`:6543`). Use `DIRECT_DATABASE_URL` (port **5432** direct) for migrations, or local `localhost:5433` for dev |
| `Failed to find Server Action "y"` | Old browser tab after redeploy, or missing `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`. Set the same key at **image build** time, rebuild, hard-refresh the site |
| `npm error signal SIGTERM` on startup | Container was stopped during redeploy (often harmless). On SwiftWave/Railway: **do not** use `npm run start` as the start command; use Dockerfile `CMD`. Set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` at build time |
| Empty library after deploy | Run `npm run db:seed` once |
| Prisma client not found | Build runs `prisma generate`; clear cache and redeploy |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL (build + runtime; pooled URL OK for app) |
| `DIRECT_DATABASE_URL` | Supabase migrations | Direct Postgres URL (port 5432). Required for `db:migrate` when `DATABASE_URL` uses Supabase pooler `:6543` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Docker / multi-instance | `openssl rand -base64 32` — GitHub **Production** environment secret for GHCR builds; must match at build **and** runtime (Dockerfile embeds it from the build arg; Next.js ignores disk cache inside containers) |
| `NODE_ENV` | Recommended | `production` on Vercel |
| `ADMIN_EMAIL` | For login | Admin email (no database — env only); both required to enable login |
| `ADMIN_PASSWORD` | For login | Admin password |
| `COOKIE_SECURE` | HTTP-only deploy | Set to `false` if the site has no HTTPS (cookies use `Secure` in production by default) |

### Admin login (email + password)

The app has **no user accounts in the database**. For a private live deployment, set both variables on the host (Vercel, Railway, Docker, etc.):

```bash
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-strong-password
```

Redeploy or restart the container. Visitors are redirected to `/login` until they sign in. `/api/health` stays public for Docker health checks.

Leave both **unset** during local dev if you want open access without signing in.

**Vercel:** Project → Settings → Environment Variables → add the three for Production (and Preview if needed).

**Docker Compose:** set them in `.env` (see `.env.compose.example`).

See [.env.example](./.env.example).
