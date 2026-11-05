# API Reference

The app's API is tRPC, mounted at `/api/trpc`. A handful of REST route handlers live in `app/api`. Authentication itself is Better Auth at `/api/auth/*` (see [authentication.md](authentication.md)).

## Where the code lives

| What | File |
|------|------|
| tRPC init, context, `publicProcedure`, `protectedProcedure` | `server/api/trpc.ts` |
| Root router (namespaces below) | `server/api/routers/_app.ts` |
| One file per router | `server/api/routers/<name>.ts` |
| HTTP handler (rate limited) | `app/api/trpc/[trpc]/route.ts` |
| Client hooks | `lib/trpc/client.ts` (`trpc`) |
| Server Component caller | `lib/trpc/server.ts` (`createServerCaller`) |

## Usage

```ts
// Client Component
'use client'
import { trpc } from '@/lib/trpc/client'
const { data } = trpc.user.getCurrent.useQuery()

// Server Component / route handler
import { createServerCaller } from '@/lib/trpc/server'
const caller = await createServerCaller()
const me = await caller.user.getCurrent()
```

Context (`createTRPCContext`): `prisma`, `user`, `session`, `ipAddress` (from `x-forwarded-for`), `userAgent`. There is no workspace in context; workspace procedures take `organizationId`. Transformer is superjson; Zod errors are returned flattened in `error.data.zodError`.

## Auth levels

Only two procedure builders exist:

- `public`: `publicProcedure`, no session needed.
- `user`: `protectedProcedure`, throws `UNAUTHORIZED` without a session.

Further checks happen inside the procedure body. In the tables below:

- `admin`: `isUserAdmin(ctx.user.email)` from `lib/auth/admin-helpers.ts` (driven by `ADMIN_EMAILS`), else `FORBIDDEN`.
- `member`: caller must be a member of the `organizationId` workspace.
- `perm:x`: member whose role grants permission `x` (see [rbac.md](rbac.md)).
- `owner`: member whose role contains `*`.

To add a procedure: add it to the relevant router file, or create `server/api/routers/<name>.ts` and register it in `_app.ts`.

## Routers

### user

Current user's account. All operate on `ctx.user` unless noted.

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getById | query | public | Any user's id, email, name, image, createdAt by id |
| getCurrent | query | user | Current user profile |
| updateProfile | mutation | user | Update name, bio, image, etc. |
| deleteAccount | mutation | user | Delete own user row |
| isAdmin | query | user | Whether the caller's email is in `ADMIN_EMAILS` |
| requestEmailChange | mutation | user | Start email change, sends verification |
| confirmEmailChange | mutation | user | Confirm email change with token |
| changePassword | mutation | user | Change password |
| listSessions | query | user | Active sessions |
| revokeSession | mutation | user | Revoke one session |
| revokeAllSessions | mutation | user | Revoke all other sessions |
| setup2FA | mutation | user | Start TOTP setup |
| verify2FA | mutation | user | Confirm TOTP setup |
| disable2FA | mutation | user | Turn off 2FA |
| regenerateBackupCodes | mutation | user | New 2FA backup codes |
| listPasskeys | query | user | Registered passkeys |
| renamePasskey | mutation | user | Rename a passkey |
| removePasskey | mutation | user | Delete a passkey |
| exportAccountData | mutation | user | JSON export of the user's data |
| getUserActivityLog | query | user | Caller's audit log entries, paginated |

### workspace

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| ensureDefault | mutation | user | Create a default workspace if the user has none |
| list | query | user | Caller's non-archived workspaces with role |
| listArchived | query | user | Caller's archived workspaces |
| getById | query | member | Workspace with members |
| create | mutation | user | New workspace plus default roles; caller is Owner |
| update | mutation | perm:workspace:update | Name, description, logo |
| delete | mutation | owner | Delete workspace |
| updateMemberRole | mutation | perm:member:manage | Change one member's role |
| removeMember | mutation | perm:member:remove | Remove one member |
| transferOwnership | mutation | owner | Make another member Owner, demote caller to Admin |
| bulkUpdateMemberRoles | mutation | perm:member:manage | Change several members' roles |
| bulkRemoveMembers | mutation | perm:member:remove | Remove several members |
| getTeamPanelData | query | member | Members, roles, current user and role for the team page |
| getWorkspaceUsage | query | member | Member, invite and activity counts |
| cloneWorkspace | mutation | member | Copy a workspace's roles into a new workspace |
| archiveWorkspace | mutation | owner | Archive |
| unarchiveWorkspace | mutation | owner | Restore |

### permissions

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| listRoles | query | member | Workspace roles |
| createRole | mutation | perm:role:create | Custom role |
| updateRole | mutation | perm:role:update | Edit a non-system role |
| deleteRole | mutation | perm:role:delete | Delete a non-system role |

### invitations

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| list | query | member | Pending invitations |
| create | mutation | perm:member:invite | Email invitation (does not send email) |
| getByToken | query | public | Invitation details for the accept page |
| accept | mutation | user | Accept email invite; email must match |
| cancel | mutation | user (inviter or any member) | Expire an invitation |
| createInviteLink | mutation | perm:member:invite | Reusable invite link |
| listInviteLinks | query | member | Active invite links |
| revokeInviteLink | mutation | perm:member:invite or link creator | Expire a link |
| acceptInviteLink | mutation | user | Join via token (used for both kinds by `/invite/[token]`) |
| bulkInviteMembers | mutation | perm:member:invite | Many email invitations at once |

### apiKeys

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| list | query | member | Keys (last 8 chars only) |
| create | mutation | perm:settings:update | Create key; full key returned once |
| revoke | mutation | perm:settings:update | Delete key |
| validate | query | user | Resolve a key to its workspace, bump `lastUsedAt` |

### notifications

All scoped to the caller's own notifications.

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| list | query | user | Paginated (cursor), filter by read/unread |
| markAsRead | mutation | user | Mark one read |
| markAllAsRead | mutation | user | Mark all read |
| delete | mutation | user | Delete one |

### storage

Supabase Storage via `lib/supabase/server.ts`. Bucket names must match `^[a-z0-9-]+$`; `avatars`, `documents`, `images` have extension and size limits (5/10/10 MB).

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getUploadUrl | mutation | user | Signed upload URL |
| getPublicUrl | query | user | Public URL for a path |
| deleteFile | mutation | user | Delete a path |
| listFiles | query | user | List a folder |

### analytics

With `organizationId`: requires membership and uses workspace data. Without it: uses the caller's own data.

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getStats | query | user | Counts across the caller's workspaces |
| getUserGrowth | query | user / member | Member joins over N days |
| getActivityMetrics | query | user / member | Audit log activity over N days |
| getRecentActivities | query | user / member | Latest audit log entries |
| getRevenue | query | user / member | Random sample data, not real revenue |
| getActivityHeatmap | query | user / member | Activity by weekday and hour; random demo data when there are no logs |

### admin

Platform admin. See [admin.md](admin.md).

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getAllUsers | query | admin | Paginated, searchable user list |
| getSystemStats | query | admin | Platform counts |
| getAuditLogs | query | admin | Filterable audit log |
| deleteUser | mutation | admin | Delete a user |
| updateUserStatus | mutation | admin | Ban or unban a user |
| getAuditLogActions | query | admin | Distinct action names for filters |

### theme

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getAvailableThemes | query | public | Theme list from `lib/theme/config` |
| getActiveTheme | query | public | Active theme id |
| getThemeCSS | query | public | CSS for a theme |
| setActiveTheme | mutation | admin | Set the app-wide theme |

See [theming.md](theming.md).

### maintenance

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| getStatus | query | public | Maintenance flag and message |
| enable | mutation | admin | Turn on maintenance mode |
| disable | mutation | admin | Turn it off |

### feedback

Both email every address in `ADMIN_EMAILS` via `EmailService` (see [emails.md](emails.md)).

| Procedure | Type | Auth | Purpose |
|-----------|------|------|---------|
| submitFeedback | mutation | user | Send product feedback |
| submitSupport | mutation | user | Send a support request |

## REST routes (`app/api`)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/[...all]` | GET, POST | Better Auth | All auth endpoints (`toNextJsHandler(auth)`) |
| `/api/trpc/[trpc]` | GET, POST | per procedure | tRPC handler |
| `/api/csrf` | GET | public | Issues a CSRF token (`x-csrf-token`); see gotchas |
| `/api/theme` | GET | public | Active theme CSS, cached 60 s |
| `/api/email/preview?template=...` | GET | public, disabled in production | Render an email template |
| `/api/admin/emails/test` | POST | admin (`requireAdmin`) | Send a test email, strict rate limit |
| `/api/admin/impersonation/start` | POST | admin (`requireAdmin`) | Start impersonating a user |
| `/api/admin/impersonation/stop` | POST | active impersonation | End impersonation |

## Gotchas

- Rate limiting: every tRPC request goes through `checkRateLimit()` (`lib/rate-limit.ts`) with the default limiter, 100 requests per 15 minutes per client IP, in memory. A single page can make many tRPC calls, and the in-memory store is per instance. Over the limit returns HTTP 429.
- CSRF: `/api/csrf` issues tokens and `lib/csrf.ts` has `validateCSRF`, but nothing calls it. No route verifies CSRF tokens.
- `protectedProcedure` only checks login. Workspace and admin checks are hand-written in each procedure, so a new procedure has no tenancy or permission protection until you add it.
- Errors are `TRPCError` codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`. Bulk procedures return per-item success and failure counts instead of throwing.

Related: [workspaces.md](workspaces.md), [rbac.md](rbac.md), [admin.md](admin.md), [architecture.md](architecture.md).
