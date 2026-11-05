# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Codex, Copilot, and others) and for humans who want the short version. Human-oriented guides live in [`docs/`](docs/README.md).

## Project

Multi-tenant SaaS starter: Next.js 16 App Router, React 19, Better Auth, tRPC 11, Prisma 7 on PostgreSQL, Tailwind 4 with shadcn/ui. TypeScript strict.

- **Package manager:** `pnpm` only (pnpm 11). Never npm or yarn.
- **Node:** 24+ (`.nvmrc`).

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (localhost:3000) |
| Typecheck | `pnpm typecheck` (run `pnpm exec next typegen` first on a fresh clone) |
| Lint / fix | `pnpm lint` / `pnpm lint:fix` (Oxlint) |
| Format | `pnpm format` (Biome; Markdown is excluded) |
| Build | `pnpm build` |
| E2E smoke | `pnpm build && pnpm test:e2e` (Playwright against `pnpm start`, needs seeded DB) |
| RBAC integration | `pnpm test:rbac` (writes to the DB in `DATABASE_URL`) |
| Email render | `pnpm test:emails` |
| Prisma client | `pnpm db:generate` (output in `prisma/generated`, gitignored) |
| New migration | `pnpm db:migrate` (`prisma migrate dev`) |
| Apply migrations (prod) | `pnpm db:migrate:deploy` |
| Seed | `pnpm db:seed` (demo user `demo@yourdomain.com` / `demo1234`) |
| Add shadcn component | `pnpm shadcn:add <name>` |

The `db:*` scripts read `.env.local` via `dotenv`. CI does not have that file and calls `pnpm exec prisma ...` directly.

## Before you say "done"

CI (`.github/workflows/ci.yml`) runs, in order: `prisma generate`, `prisma migrate deploy`, seed, `next typegen`, `typecheck`, `lint`, `test:rbac`, `build`, `test:emails`, `test:e2e`. At minimum run `pnpm typecheck && pnpm lint` for any code change. Run `pnpm test:emails` when touching `emails/` or `lib/email/`, and `pnpm test:rbac` when touching workspace, member, role or permission logic. The husky pre-commit hook runs `pnpm format && pnpm lint:fix`.

## Database safety

- Never run migrations, `db:push`, seeds or `test:rbac` against a hosted or production database. Use a local Postgres, for example:
  `docker run -d --name saas-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saas -p 5432:5432 postgres:16-alpine`
  and point `DATABASE_URL` / `DIRECT_URL` at `postgresql://postgres:postgres@localhost:5432/saas`.
- Schema changes go through `prisma migrate dev` so a migration file is committed. Don't hand-edit files in `prisma/migrations/`.

## Layout

```
app/                  Next.js routes: (auth), (dashboard), (admin), api/, invite/
server/api/trpc.ts    tRPC context + publicProcedure / protectedProcedure
server/api/routers/   One router per domain; register new ones in _app.ts
lib/auth/             Better Auth server config (config.ts), client, admin + impersonation helpers
lib/permissions/      Workspace permission constants and checker (authoritative)
lib/email/            EmailService (Resend); templates live in emails/
lib/trpc/             server.ts (createServerCaller), client.ts (React Query hooks)
lib/env.ts            Zod-validated env vars
proxy.ts              Route protection + CSP/security headers (Next 16 "middleware")
prisma/schema.prisma  14 models; client imported from @/prisma/generated/prisma/client via lib/prisma.ts
components/ui/        shadcn/ui (generated, prefer not to hand-edit)
emails/               React Email templates
themes/               14 theme CSS files
e2e/, scripts/        Playwright smoke suite; check-rbac.ts and render-emails.ts
```

## Conventions

- **Server Components by default.** Add `'use client'` only for state, effects, or browser APIs.
- **Data access goes through tRPC.** Server components: `const caller = await createServerCaller()` from `@/lib/trpc/server`. Client components: `trpc.<router>.<proc>.useQuery()` from `@/lib/trpc/client`.
- **Validate every procedure input with Zod.** Use `protectedProcedure` for anything that needs a user.
- **Workspaces are `Organization` in Prisma.** There is no `ctx.workspaceId`; procedures take the workspace id as input and must check membership and permission themselves. The pattern (see `server/api/routers/workspace.ts`):
  ```ts
  const membership = await ctx.prisma.organizationMember.findFirst({
    where: { organizationId: input.id, userId: ctx.user.id },
    include: { role: true },
  })
  if (!membership) throw new TRPCError({ code: 'FORBIDDEN' })
  if (!hasPermission(toPermissions(membership.role.permissions), 'workspace:update'))
    throw new TRPCError({ code: 'FORBIDDEN' })
  ```
  Always scope queries by `organizationId`. Never trust a workspace id from the client without this check.
- **Admin-only code** checks `isUserAdmin` / `requireAdmin` from `lib/auth/admin-helpers.ts` (driven by `ADMIN_EMAILS`).
- **Related writes** use `ctx.prisma.$transaction`.
- **Style:** Biome formats with tabs, single quotes, no semicolons, 80 columns. Use the `@/` import alias. No emojis in code or UI copy unless asked.
- **Commits:** Conventional Commits (`feat(auth): ...`, `fix(rbac): ...`).
- Prefer editing existing files and reusing `components/ui`, hooks in `hooks/`, and helpers in `lib/` before adding new ones or new dependencies.

## Gotchas

- `proxy.ts` is the Next 16 replacement for `middleware.ts`. Don't add a `middleware.ts`.
- Two permission vocabularies exist: `lib/permissions/` (used by the API, authoritative) and `lib/rbac/permissions.ts` (used only by `components/rbac/permission-guard.tsx`). Use `lib/permissions/` for new code.
- 2FA can be enabled in settings but is **not enforced at sign-in**. There is no SSO/SAML/Okta implementation, even though `lib/env.ts` declares those variables (as well as unused Mailchimp, Loops, ConvertKit, Sentry, PostHog and GA keys).
- Email, OAuth providers and Supabase storage are optional and turn on only when their env keys are set. The build must succeed without them.
- `NOINDEX` is read at build time (`next.config.mjs`); setting it only at runtime does nothing.
- `BETTER_AUTH_URL` must match the origin the browser uses, or sign-in fails the origin check (relevant for E2E and preview deploys).
- E2E tests run against the production build, so `pnpm build` must come first.
- `next.config.mjs` sets `ignoreBuildErrors: true`, so `pnpm build` passes with type errors. `pnpm typecheck` is the real type gate.
- There is no `postinstall` hook: run `pnpm db:generate` after install or schema changes, or imports from `@/prisma/generated` fail.
- Several workspace, invitation and storage procedures have known authorization gaps (for example `invitations.cancel` always allows, `storage.*` is not scoped to the caller). They are listed in [docs/rbac.md](docs/rbac.md) and [docs/api.md](docs/api.md). Don't copy their checks as a pattern; use the one above.
- `User.banned` is only checked by the admin helpers. Banned users can still sign in and keep their sessions.
- Admin impersonation shows a banner and writes audit entries, but the acting user is never switched (`getEffectiveUserId` in `lib/auth/impersonation.ts` has no callers).
- `ADMIN_EMAILS` promotes a user by setting `User.isAdmin` on first check. Removing the email later does not revoke it; clear the flag in the database.
- `lib/rate-limit.ts` keeps its counters in memory, so limits are per server instance, not global.
- The `themes/` CSS files are read from disk at runtime and must ship with the deployment.

## Docs

Update the matching guide in `docs/` when you change behavior it describes: [getting started](docs/getting-started.md), [architecture](docs/architecture.md), [authentication](docs/authentication.md), [RBAC](docs/rbac.md), [workspaces](docs/workspaces.md), [API](docs/api.md), [emails](docs/emails.md), [admin](docs/admin.md), [theming](docs/theming.md), [shadcn components](docs/shadcn-components.md), [deployment](docs/deployment.md).
