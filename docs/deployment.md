# Deployment

The app is a standard Next.js 16 server (`pnpm build` then `pnpm start`) backed by PostgreSQL. Any Node 24 host works (Vercel, Railway, Render, a VPS). Nothing in the repo is platform-specific except `lib/trpc/client.ts`, which reads `VERCEL_URL` when present.

## Build and release steps

Every deploy needs, in order:

```bash
pnpm install --frozen-lockfile
pnpm exec prisma generate         # client goes to prisma/generated, which is gitignored
pnpm exec prisma migrate deploy   # = pnpm db:migrate:deploy; uses DIRECT_URL, falls back to DATABASE_URL
pnpm build
pnpm start                        # honours PORT
```

There is no `postinstall` hook, so on hosted platforms set the build command to `pnpm exec prisma generate && pnpm build` and run `migrate deploy` as a release step (or in the build if your platform has no release phase). Do not use `pnpm db:migrate` in production: it runs `prisma migrate dev`. Do not run `pnpm db:seed` in production: it deletes all users and workspaces.

`.github/workflows/ci.yml` runs the same sequence against Postgres 16 and is the reference for a working build.

## Environment variables

`lib/env.ts` validates these when first imported, which also happens during `next build`, so set them for both build and runtime.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Pooled connection is fine (e.g. PgBouncer / Supabase pooler). Use `sslmode=require` for hosted DBs. |
| `DIRECT_URL` | Non-pooled connection, used by Prisma migrations (`prisma.config.ts`). |
| `BETTER_AUTH_SECRET` | 32+ chars: `openssl rand -base64 32`. Rotating it invalidates sessions. |
| `BETTER_AUTH_URL` | Public origin, e.g. `https://app.example.com`. Must match the URL users hit or sign-in fails the origin check. |
| `NEXT_PUBLIC_APP_URL` | Same origin. Inlined at build time. |

Optional:

| Variable | Effect |
| --- | --- |
| `ADMIN_EMAILS` | Comma-separated; these users are promoted to admin on first visit to `/admin`. See [admin.md](./admin.md). |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | Email via Resend. Effectively required in production: email/password sign-up requires verification when `NODE_ENV=production`. See [emails.md](./emails.md). |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `GITHUB_CLIENT_ID`/`_SECRET`, `MICROSOFT_CLIENT_ID`/`_SECRET` | OAuth. Register `https://<your-domain>/api/auth/callback/<provider>` with each provider. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Storage uploads and realtime. |
| `NEXT_PUBLIC_APP_NAME` | Issuer label shown in authenticator apps for 2FA. |
| `SECURITY_LOG_WEBHOOK` | `lib/logger.ts` POSTs security events here in production. |
| `ENABLE_PRODUCTION_LOGS` | Enables info-level logging in production. |
| `NOINDEX` | Build-time only. `NOINDEX=true pnpm build` adds `X-Robots-Tag: noindex, nofollow` to every route (`next.config.mjs`); setting it at runtime does nothing. `/robots.txt` stays public either way. |

`.env.local.example` also lists Mailchimp, Loops, ConvertKit, SAML, Okta, Sentry, PostHog and GA keys. No code uses them.

## Platform notes

- **Vercel**: import the repo, set the env vars above, override the build command as described. Run migrations from CI or locally against `DIRECT_URL` before promoting.
- **Railway / Render / similar**: build `pnpm install --frozen-lockfile && pnpm exec prisma generate && pnpm build`, pre-deploy `pnpm exec prisma migrate deploy`, start `pnpm start`.
- **VPS**: same commands, behind a reverse proxy (nginx, Caddy) that terminates TLS and forwards `Host` and `X-Forwarded-For`/`-Proto`. Use a process manager (systemd, PM2) for `pnpm start`.

## Limits to know before going live

- **Rate limiting is in memory** (`lib/rate-limit.ts`): 100 req / 15 min per IP on tRPC, 10 / 15 min on impersonation start and test-email routes. Counters are per process, so they reset on restart and are not shared across instances or serverless invocations. Swap in Redis if you scale out; the file has a sketch.
- **No health endpoint** exists. Add one under `app/api/` if your platform needs it (`/api/*` is excluded from the auth proxy).
- **Security headers** are set twice, in `next.config.mjs` and `proxy.ts`. Edit both when changing CSP.
- **2FA is not enforced at sign-in** even when a user has enabled it. See [authentication.md](./authentication.md).
- Backups, monitoring and error tracking are not included. Use your database provider's backups.

## Rollback

Code rollback is your platform's previous deployment. Prisma migrations are forward-only; to undo a schema change, write a new migration.
