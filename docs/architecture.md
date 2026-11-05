# Architecture

How the pieces fit together. Diagram: [architecture.svg](./architecture.svg).

## Stack

- Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui, `motion` for animation
- tRPC 11 (superjson transformer) over TanStack Query
- Prisma 7 with `@prisma/adapter-pg`, PostgreSQL
- Better Auth (passwords hashed with bcrypt in `lib/auth/config.ts`)
- Zod 4 for input validation
- Resend + React Email for email, Supabase for file storage
- Playwright for the e2e smoke suite; CI in `.github/workflows/ci.yml`

## Request flow

1. `proxy.ts` (Next 16's renamed middleware) runs on every matched request. It refreshes the Supabase session (`lib/supabase/middleware.ts`), sets CSP and security headers, redirects signed-in users away from auth pages, and redirects anonymous users to `/login?redirect=...`.
2. Pages are Server Components by default. They read data through the tRPC server caller (`lib/trpc/server.ts`) or auth helpers (`lib/auth/auth-helpers.ts`: `requireAuth`, `getAuthSession`, `getAuthUser`).
3. Client Components call tRPC through `lib/trpc/client.ts` via `app/api/trpc/[trpc]/route.ts`, which applies the in-memory rate limiter (`lib/rate-limit.ts`).
4. Procedures in `server/api/routers/*` use `ctx.prisma` (`lib/prisma.ts`) to reach Postgres.

Admin pages are guarded by `requireAdmin()` in `app/(admin)/admin/layout.tsx`; admin status comes from `ADMIN_EMAILS` (`lib/auth/admin-helpers.ts`).

## Where code lives

| Path | Contents |
|------|----------|
| `app/(auth)/` | login, signup, password reset, email/OTP verification, 2FA setup |
| `app/(dashboard)/` | dashboard, settings, workspace pages |
| `app/(admin)/admin/` | users, workspaces, audit, emails, maintenance, themes |
| `app/api/` | `auth/[...all]` (Better Auth), `trpc/[trpc]`, `admin/*`, `csrf`, `email/preview`, `theme` |
| `server/api/trpc.ts` | context, `publicProcedure`, `protectedProcedure` |
| `server/api/routers/` | `_app.ts` plus admin, analytics, api-keys, feedback, invitations, maintenance, notifications, permissions, storage, theme, user, workspace |
| `lib/auth/` | Better Auth server/client config, admin and impersonation helpers |
| `lib/permissions/`, `lib/rbac/` | permission constants and checkers |
| `lib/workspace/workspace-context.tsx` | client-side current workspace |
| `lib/email/`, `emails/` | email service and React Email templates |
| `lib/theme/`, `themes/` | theme registry and CSS |
| `components/ui/` | shadcn components |
| `hooks/` | client hooks |
| `prisma/schema.prisma` | 14 models; client generated to `prisma/generated` |

## Data model

14 models: `User`, `Session`, `Account`, `Verification`, `Organization`, `OrganizationMember`, `Role`, `Invitation`, `Notification`, `AuditLog`, `TwoFactorAuth`, `Passkey`, `SystemSettings`, `APIKey`. See `prisma/schema.prisma`.

A workspace is an `Organization`. Users join through `OrganizationMember`, which points to a `Role` whose `permissions` is a JSON column. `SystemSettings` is a single row (`id = 'system'`) holding the active theme and maintenance mode.

## Patterns to copy

**tRPC context has no workspace.** `ctx` contains `prisma`, `user`, `session`, `ipAddress`, `userAgent`. Workspace-scoped procedures take the workspace id as input, look up the caller's membership, and check the permission inline:

```ts
const membership = await ctx.prisma.organizationMember.findFirst({
	where: { organizationId: input.id, userId: ctx.user.id },
	include: { role: true },
})
if (!membership) throw new TRPCError({ code: 'FORBIDDEN' })
if (!hasPermission(toPermissions(membership.role.permissions), 'workspace:update'))
	throw new TRPCError({ code: 'FORBIDDEN' })
```

`hasPermission` and `toPermissions` come from `lib/permissions/checker.ts`. See `server/api/routers/workspace.ts` for real examples and [rbac.md](./rbac.md) for the permission list.

**UI gating** uses `components/rbac/permission-guard.tsx` (`<PermissionGuard permission="...">`) with `hooks/use-permissions.ts`. UI checks are cosmetic; the procedure check is the real one.

**Current workspace** is chosen on the client and stored in `localStorage` by `WorkspaceProvider` (`lib/workspace/workspace-context.tsx`), then passed to procedures as input.

**Audit logging** is an explicit `ctx.prisma.auditLog.create(...)` in the procedure (see `server/api/routers/theme.ts`).

## Realtime

There is no live realtime feature wired in:

- `hooks/use-realtime-notifications.ts` polls `notifications.list` every 30 seconds.
- `hooks/use-realtime.ts` subscribes to a Supabase Realtime broadcast channel, but nothing in `app/` or `components/` uses it.
- `hooks/use-presence.ts` is a stub that always returns an empty list.

## Limits

- Rate limiting is in-process memory. It does not share state across instances or survive restarts.
- Next.js `revalidate`/ISR, Redis, and error tracking are not set up.
- Tests: Playwright smoke suite (`e2e/smoke.spec.ts`), email render check (`pnpm test:emails`), RBAC check (`pnpm test:rbac`). There are no unit tests.

## Related

[getting-started.md](./getting-started.md), [authentication.md](./authentication.md), [workspaces.md](./workspaces.md), [api.md](./api.md), [deployment.md](./deployment.md)
