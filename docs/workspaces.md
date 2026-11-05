# Workspaces

A workspace is the tenant unit. In the database it is the Prisma `Organization` model; users join through `OrganizationMember` (one row per user per workspace, with a `roleId`). Roles and permissions are described in [rbac.md](rbac.md).

## Where the code lives

| What | File |
|------|------|
| Models `Organization`, `OrganizationMember`, `Role`, `Invitation`, `APIKey` | `prisma/schema.prisma` |
| Workspace and member procedures | `server/api/routers/workspace.ts` |
| Invitations and invite links | `server/api/routers/invitations.ts` |
| API keys | `server/api/routers/api-keys.ts` |
| Membership helpers (`verifyMembershipWithRole`, stats) | `server/api/utils/db-helpers.ts` |
| Active workspace on the client (`WorkspaceProvider`, `useWorkspace`) | `lib/workspace/workspace-context.tsx`, mounted in `app/layout.tsx` |
| Pages | `app/(dashboard)/workspace/{settings,roles,api-keys}`, `app/(dashboard)/settings/team`, `app/(dashboard)/settings/workspaces/archived`, `app/invite/[token]` |
| Components | `components/workspace/*`, `components/settings/{team-*,invite-*,bulk-invite-dialog,pending-invitations,transfer-ownership-dialog}.tsx` |

Full procedure list: [api.md](api.md#workspace).

## Tenancy model

- The server has no notion of a "current" workspace. The tRPC context (`server/api/trpc.ts`) carries only the user and session. Every workspace-scoped procedure takes `organizationId` (or reads it from the record it loads) and must check membership itself.
- The client picks the active workspace in `WorkspaceProvider`: it loads `workspace.list`, restores the last choice from `localStorage` key `current-workspace-id`, falls back to the first workspace, and calls `workspace.ensureDefault` if the user has none. Components read it with `useWorkspace()` and pass `currentWorkspace.id` as `organizationId`.
- `currentWorkspace.role.permissions` is available on the client for UI gating.

Pattern for a new workspace-scoped procedure:

```ts
myThing: protectedProcedure
	.input(z.object({ organizationId: z.string() }))
	.query(async ({ ctx, input }) => {
		await verifyMembershipWithRole(ctx.prisma, ctx.user.id, input.organizationId)
		return ctx.prisma.thing.findMany({ where: { organizationId: input.organizationId } })
	}),
```

Add a permission check (see [rbac.md](rbac.md#how-a-check-works)) for anything that writes.

## Lifecycle

| Action | Procedure | Who |
|--------|-----------|-----|
| Default workspace on first sign-in | `workspace.ensureDefault` (called from `components/auth/auth-form.tsx` and `WorkspaceProvider`) | Any user with no membership |
| Create | `workspace.create({ name, slug, description? })`, from the workspace switcher / sidebar | Any user; creator becomes Owner |
| Update name, description, logo | `workspace.update` | `workspace:update` |
| Clone | `workspace.cloneWorkspace({ organizationId, newName, newSlug })` | Any member of the source |
| Archive / unarchive | `workspace.archiveWorkspace` / `unarchiveWorkspace` | Owner |
| Delete | `workspace.delete({ id })` (no UI) | Owner |

Creating a workspace also creates the four system roles (Owner, Admin, Member, Viewer). Slugs are `^[a-z0-9-]+$`, max 50 chars, unique. Cloning copies roles only, not members, invitations or API keys; the cloner becomes Owner.

Archiving sets `archived`, `archivedAt`, `archivedBy`. Archived workspaces drop out of `workspace.list` and show up in `workspace.listArchived`. Nothing else is blocked: procedures called with an archived workspace's ID still work.

Deleting cascades to members, roles, invitations and API keys; audit logs are kept with `organizationId` set to null.

## Members

| Action | Procedure | Requires |
|--------|-----------|----------|
| List members, roles, pending invites | `workspace.getTeamPanelData` (team page) or `workspace.getById` | Membership |
| Change role | `workspace.updateMemberRole`, `bulkUpdateMemberRoles` | `member:manage` |
| Remove | `workspace.removeMember`, `bulkRemoveMembers` | `member:remove` |
| Transfer ownership | `workspace.transferOwnership({ organizationId, newOwnerId })` | Owner; caller is demoted to the `Admin` system role |
| Usage metrics | `workspace.getWorkspaceUsage` | Membership |

Last-owner protection applies to `updateMemberRole`, `removeMember` and `bulkRemoveMembers` (see [rbac.md](rbac.md#ownership-rules)). Role changes and removals write `AuditLog` rows.

## Invitations

Both kinds are rows in `Invitation` with a random 64-hex-char `token`, accepted at `/invite/[token]` (`components/invitations/accept-invitation.tsx`).

| Kind | Create | Expiry | Notes |
|------|--------|--------|-------|
| Email (`type: 'email'`) | `invitations.create({ organizationId, email, roleId })`, `bulkInviteMembers({ organizationId, emails, roleId })` | 7 days | Rejects existing members and duplicate pending invites |
| Link (`type: 'link'`) | `invitations.createInviteLink({ organizationId, roleId, maxUses?, expiresInDays = 7 })` | configurable | `usedCount` increments per join; revoke with `revokeInviteLink` |

All creation requires `member:invite`. `invitations.list` / `listInviteLinks` require membership; `cancel` is allowed for the inviter or any member.

Gotchas:
- No invitation email is sent. The tRPC procedures only create the row; `EmailService.sendInvitation` (`lib/email/service.ts`) is only called by the admin test-email route. Share the link yourself or wire the send in. See [emails.md](emails.md).
- The accept page calls `invitations.acceptInviteLink` for both kinds. That path does not check that the signed-in user's email matches an email invite (only `invitations.accept` does), so anyone holding the token can join.
- `roleId` is not validated on create: it is not checked to belong to the workspace, and an inviter can grant a role higher than their own (including Owner).
- Status strings are lowercase (`pending`, `accepted`, `expired`), but `getById`, `getTeamPanelData` and `getWorkspaceUsage` filter pending invites with `'PENDING'`, so they always report none. The team page's pending list comes from `invitations.list`, which is correct.

## API keys

Workspace-scoped keys in `APIKey`, managed at `/workspace/api-keys`.

- `apiKeys.create` returns the full key (`sk_live_` + 64 hex) once. Only its SHA-256 hash and the last 8 characters are stored.
- `create` and `revoke` require `settings:update`; `list` requires membership.
- `apiKeys.validate({ key })` resolves a key to its workspace and updates `lastUsedAt`, but it is a `protectedProcedure` and no route authenticates requests by API key. Keys are stored and listed; using them for auth is up to you.

## Gotchas

- Forgetting the membership check is the main tenancy risk: nothing enforces it globally.
- With the default role arrays, only Owners can invite, manage members or manage API keys (see [rbac.md](rbac.md#default-roles)).
- `user.deleteAccount` deletes the user and cascades their memberships, which can leave a workspace with no owner.

Related: [rbac.md](rbac.md), [api.md](api.md), [admin.md](admin.md).
