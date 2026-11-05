# Admin Dashboard

A site-wide admin area at `/admin` for managing users, reading audit logs, impersonating users, toggling maintenance mode, switching the app theme and sending test emails. It is separate from workspace roles (see [rbac.md](./rbac.md)).

## Who is an admin

A user is an admin if `User.isAdmin` is true in the database, or their email is in `ADMIN_EMAILS` (comma-separated). Banned users are never admins.

```env
ADMIN_EMAILS=you@example.com,other@example.com
```

Two helpers in `lib/auth/admin-helpers.ts`:

- `requireAdmin()` for pages and route handlers. Redirects to `/login` if signed out or banned, to `/unauthorized` if not an admin. If the email is in `ADMIN_EMAILS`, it sets `isAdmin = true` in the database on first visit, so removing an email from `ADMIN_EMAILS` later does not revoke access; clear `isAdmin` too.
- `isUserAdmin(email)` returns a boolean. Used inside tRPC procedures.

`app/(admin)/admin/layout.tsx` calls `requireAdmin()`, so every page under `/admin` is protected.

## Where the code lives

| Page | Path | Main component |
| --- | --- | --- |
| Overview stats | `app/(admin)/admin/page.tsx` | |
| Users | `app/(admin)/admin/users/page.tsx` | `components/admin/users-table.tsx` |
| Audit logs | `app/(admin)/admin/audit/page.tsx` | `components/admin/audit-log-table.tsx` |
| Maintenance | `app/(admin)/admin/maintenance/page.tsx` | `components/admin/maintenance-manager.tsx` |
| Themes | `app/(admin)/admin/themes/page.tsx` | `components/admin/theme-manager.tsx` |
| Emails | `app/(admin)/admin/emails/page.tsx` | `components/admin/email-templates-manager.tsx` |

`app/(admin)/admin/workspaces/` is an empty directory; there is no workspace admin page.

## tRPC procedures

All are `protectedProcedure` with an inline `isUserAdmin` check that throws `FORBIDDEN`.

`server/api/routers/admin.ts`:

| Procedure | Input | Notes |
| --- | --- | --- |
| `getAllUsers` | `limit` (max 100), `offset`, `search?` | Search matches name or email. |
| `getSystemStats` | none | `totalUsers`, `totalOrganizations`, `totalMembers`, `recentUsers` (30 days), `activeUsers` (`updatedAt` in last 7 days). |
| `getAuditLogs` | `limit`, `offset`, `userId?`, `organizationId?`, `action?`, `search?`, `startDate?`, `endDate?` | |
| `getAuditLogActions` | none | Distinct action strings for the filter dropdown. |
| `updateUserStatus` | `userId`, `banned?` | Sets the `banned` flag. |
| `deleteUser` | `userId` | Hard delete. Refuses to delete yourself. |

`server/api/routers/maintenance.ts`: `getStatus` (public), `enable({ message?, endTime? })`, `disable()`. Both mutations write an audit log entry.

`server/api/routers/theme.ts`: `getAvailableThemes`, `getActiveTheme`, `getThemeCSS` (public), `setActiveTheme` (admin). See [theming.md](./theming.md).

## Route handlers

| Route | Purpose |
| --- | --- |
| `POST /api/admin/impersonation/start` `{ userId }` | Start impersonation. `requireAdmin` + strict rate limit (10 / 15 min). |
| `POST /api/admin/impersonation/stop` | End impersonation. |
| `POST /api/admin/emails/test` `{ template, email }` | Send a test email. Needs `RESEND_API_KEY`. Templates: welcome, verification, password-reset, magic-link, invitation, two-factor. |

## Impersonation

Code: `lib/auth/impersonation.ts`. Starting sets a signed `impersonation_session` cookie (HS256 JWT with `BETTER_AUTH_SECRET`, 1 hour) and writes `IMPERSONATION_START`; stopping writes `IMPERSONATION_END`. `app/(dashboard)/layout.tsx` reads the cookie and shows `components/admin/impersonation-banner.tsx` with a stop button.

Limit: the cookie does not change who you are. The Better Auth session, tRPC `ctx.user` and all data queries still use the admin's identity. `getEffectiveUserId()` exists in `lib/auth/impersonation.ts` but nothing calls it. Today impersonation is a banner plus audit entries, not a real "view as user".

## Maintenance mode

Code: `lib/maintenance/server.ts`, stored on the `SystemSettings` row with id `system`. When enabled, `components/maintenance-banner-wrapper.tsx` shows a banner with the message. It does not block requests, and `endTime` is display-only; nothing disables maintenance automatically.

## Gotchas

- Banning a user only sets `User.banned`. It is enforced in `requireAdmin`/`isUserAdmin`, not at sign-in, and existing sessions are not revoked.
- `deleteUser` and `updateUserStatus` do not write audit log entries.
- Audit log action names are not standardized (for example `IMPERSONATION_START`, `maintenance.enable`, `email_changed`). Use `getAuditLogActions` to see what exists.
- There is no `adminProcedure`; copy the inline `isUserAdmin` check when adding admin procedures.

## Related

[authentication.md](./authentication.md), [emails.md](./emails.md), [theming.md](./theming.md), [api.md](./api.md).
