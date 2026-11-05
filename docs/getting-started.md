# Getting Started

How to run the app locally. For production, see [deployment.md](./deployment.md).

## Prerequisites

- Node.js 24+ (`.nvmrc`)
- pnpm (version pinned in `package.json` `packageManager`; `corepack enable` picks it up)
- PostgreSQL 16 (local Docker container or a hosted database)

## 1. Install

```bash
git clone <your-fork-url> saas-template
cd saas-template
pnpm install
```

## 2. Start a database

Option A, local Postgres in Docker (matches CI):

```bash
docker run -d --name saas-postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saas \
  -p 5432:5432 postgres:16-alpine
```

Option B, a hosted Postgres (Supabase, Neon, etc.). Use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.

## 3. Configure environment

```bash
cp .env.local.example .env.local
```

Required values (validated by `lib/env.ts`; the app will not start without them):

| Variable | Local value |
| --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/saas` |
| `DIRECT_URL` | same as above (used by Prisma migrations, see `prisma.config.ts`) |
| `BETTER_AUTH_SECRET` | 32+ chars, e.g. `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

Optional:

- `ADMIN_EMAILS`: comma-separated emails that get admin access (see [admin.md](./admin.md)).
- `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`: send real email. Without a key, auth emails are skipped and the verification link is logged to the dev server console.
- `GOOGLE_CLIENT_ID`/`_SECRET`, `GITHUB_CLIENT_ID`/`_SECRET`, `MICROSOFT_CLIENT_ID`/`_SECRET`: OAuth providers, each enabled only when both values are set. Callback URL: `<BETTER_AUTH_URL>/api/auth/callback/<provider>`.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: file uploads and realtime.

The example file also lists `MAILCHIMP_*`, `LOOPS_*`, `CONVERTKIT_*`, `SAML_*`, `OKTA_*`, `SENTRY_*`, PostHog and GA keys. Nothing reads them; leave them empty.

## 4. Create the schema and seed

```bash
pnpm db:generate   # Prisma client into prisma/generated (gitignored, required before dev/build)
pnpm db:migrate    # prisma migrate dev: applies migrations to the dev database
pnpm db:seed       # demo data
```

`db:generate`, `db:migrate`, `db:seed` and `db:studio` load `.env.local` via dotenv. `db:push` and `db:migrate:deploy` do not; they read the shell environment.

The seed **deletes all users, workspaces and related rows first**, then creates a demo admin (`demo@yourdomain.com` / `demo1234`, `isAdmin: true`), sample users and two workspaces. Only run it against a throwaway database.

## 5. Run

```bash
pnpm dev   # http://localhost:3000
```

Sign in with the demo account, or sign up. Email verification is only required when `NODE_ENV=production`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js dev server, production build, production server |
| `pnpm typecheck` | `tsc --noEmit` (run `pnpm exec next typegen` first for route types) |
| `pnpm lint` / `lint:fix` | Oxlint |
| `pnpm format` | Biome (writes changes) |
| `pnpm test:rbac` | RBAC checks against the database (`scripts/check-rbac.ts`) |
| `pnpm test:emails` | Renders every template in `emails/` |
| `pnpm test:e2e` | Playwright smoke suite (`e2e/`) against `pnpm start`; run `pnpm build` first and seed the DB |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:migrate:status` | Migration status |

## Gotchas

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` passes with type errors. Run `pnpm typecheck`; CI does.
- Admin status is the `User.isAdmin` column. Listing an email in `ADMIN_EMAILS` promotes that user the first time they open `/admin`; removing it later does not demote them.
- Route protection lives in `proxy.ts` (Next 16's name for middleware). New public pages must be added to `publicRoutes` there.

## Next

[architecture.md](./architecture.md), [authentication.md](./authentication.md), [workspaces.md](./workspaces.md), [rbac.md](./rbac.md), [api.md](./api.md).
