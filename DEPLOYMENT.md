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
| `P1000` auth failed on `localhost:5432` | Another Postgres may own port 5432; use `5433` in `.env` and `docker compose up -d postgres` (this repo maps `5433:5432`) |
| Empty library after deploy | Run `npm run db:seed` once |
| Prisma client not found | Build runs `prisma generate`; clear cache and redeploy |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL (build + runtime) |
| `NODE_ENV` | Recommended | `production` on Vercel |
| `ADMIN_EMAIL` | For login | Admin email (no database — env only) |
| `ADMIN_PASSWORD` | For login | Admin password |

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
