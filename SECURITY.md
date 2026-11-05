# Security Policy

## Reporting a vulnerability

Do not open a public issue. Email **kondasamy@pm.me** with:

- what the issue is and its impact
- steps to reproduce or a proof of concept
- the commit or version affected

You will get an acknowledgement as soon as possible. Please allow time for a fix before disclosing publicly.

## What the template does

| Area | Implementation |
| --- | --- |
| Authentication | Better Auth (`lib/auth/config.ts`): email/password, Google/GitHub/Microsoft OAuth, magic link, passkeys, email OTP. See [docs/authentication.md](docs/authentication.md). |
| Passwords | bcrypt, cost 10. |
| Email verification | Required for email/password sign-up when `NODE_ENV=production`. |
| 2FA | TOTP can be enabled per user but is **not enforced at sign-in**. |
| Route protection | `proxy.ts` redirects signed-out users to `/login` for every non-public page. `/api/*` is excluded; API routes and tRPC procedures check the session themselves (`protectedProcedure` in `server/api/trpc.ts`). |
| Authorization | Workspace permissions via `lib/permissions/checker.ts`, checked inside each procedure. Admin access via the `User.isAdmin` flag, seeded from `ADMIN_EMAILS` (`lib/auth/admin-helpers.ts`). See [docs/rbac.md](docs/rbac.md). |
| API keys | Stored as SHA-256 hashes (`server/api/routers/api-keys.ts`). |
| Rate limiting | In-memory, per IP, per process (`lib/rate-limit.ts`): 100 req / 15 min on tRPC, 10 / 15 min on impersonation and test-email routes. Not shared across instances. |
| Headers | CSP, HSTS, `X-Frame-Options: SAMEORIGIN`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, set in both `proxy.ts` and `next.config.mjs`. The CSP allows `'unsafe-inline'` and `'unsafe-eval'` for scripts. |
| Uploads | Extension allow-list and size limits per bucket in `server/api/routers/storage.ts` (avatars 5 MB, documents and images 10 MB). Files go to Supabase Storage. |
| Audit log | The `AuditLog` model records admin, impersonation, workspace, invitation, API key and settings actions. |
| Logging | `lib/logger.ts` masks secrets, tokens and emails; security events can be forwarded to `SECURITY_LOG_WEBHOOK`. |

## Before deploying

- Set a unique `BETTER_AUTH_SECRET` (32+ chars) and make `BETTER_AUTH_URL` match the public origin.
- Use TLS for the app and the database.
- Keep `ADMIN_EMAILS` short. Removing an email does not revoke admin; clear `User.isAdmin` too.
- Never run `pnpm db:seed` against production: it wipes users and creates a known demo admin (`demo@yourdomain.com` / `demo1234`).
- Replace in-memory rate limiting if you run more than one instance.
- Run `pnpm audit --prod`. Transitive security overrides live in `pnpm-workspace.yaml`.

See [docs/deployment.md](docs/deployment.md).
