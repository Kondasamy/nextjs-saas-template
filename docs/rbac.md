# RBAC and Permissions

Workspace-scoped role-based access control. Each workspace (`Organization`) has its own `Role` rows; each `Role` stores a JSON array of permission strings; each `OrganizationMember` points at exactly one role.

Platform admins are a separate mechanism (the `ADMIN_EMAILS` env var), covered in [admin.md](admin.md).

## Where the code lives

| What | File |
|------|------|
| Prisma models `Role`, `OrganizationMember` | `prisma/schema.prisma` |
| Permission check helpers (`hasPermission`, `isOwner`, `toPermissions`, ...) | `lib/permissions/checker.ts` |
| Permission constants and UI labels (`PERMISSIONS`, `PERMISSION_DEFINITIONS`) | `lib/permissions/constants.ts` |
| Role CRUD procedures | `server/api/routers/permissions.ts` |
| Member role changes, removal, ownership transfer | `server/api/routers/workspace.ts` |
| Default roles created for a new workspace | `workspace.create` and `workspace.ensureDefault` in `server/api/routers/workspace.ts` |
| Roles UI | `app/(dashboard)/workspace/roles/page.tsx`, `components/workspace/roles-table.tsx`, `components/settings/role-editor-dialog.tsx`, `components/settings/permission-browser.tsx` |
| Ownership integration test | `scripts/check-rbac.ts` (`pnpm test:rbac`) |

## How a check works

There is no permission middleware. The tRPC context has no workspace; each procedure takes an `organizationId` (or looks it up from the record), loads the caller's membership with its role, and checks inline:

```ts
import { hasPermission as permits, toPermissions } from '@/lib/permissions/checker'

const membership = await ctx.prisma.organizationMember.findFirst({
	where: { organizationId: input.organizationId, userId: ctx.user.id },
	include: { role: true },
})
if (!membership) throw new TRPCError({ code: 'FORBIDDEN' })
if (!permits(toPermissions(membership.role.permissions), 'member:invite')) {
	throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' })
}
```

`hasPermission` matching rules:
- `*` grants everything. A role containing `*` is treated as an Owner everywhere.
- Exact string match.
- `resource:*` grants every `resource:<action>`.

Always wrap `Role.permissions` with `toPermissions()`: it is a Prisma `Json` column, and `toPermissions` returns `[]` for anything that is not an array of strings.

`server/api/utils/db-helpers.ts` also has `verifyMembershipWithRole` (throws FORBIDDEN if not a member) and its own `hasPermission(prisma, userId, orgId, permission)`. The latter does not support `resource:*` wildcards and is not used by any router.

## Permissions the server actually checks

These are the only strings that gate anything server-side:

| Permission | Procedures |
|------------|-----------|
| `workspace:update` | `workspace.update` |
| `member:invite` | `invitations.create`, `createInviteLink`, `bulkInviteMembers`, `revokeInviteLink` (or the link's creator) |
| `member:manage` | `workspace.updateMemberRole`, `workspace.bulkUpdateMemberRoles` |
| `member:remove` | `workspace.removeMember`, `workspace.bulkRemoveMembers` |
| `role:create` / `role:update` / `role:delete` | `permissions.createRole` / `updateRole` / `deleteRole` |
| `settings:update` | `apiKeys.create`, `apiKeys.revoke` |
| `*` (Owner) | `workspace.delete`, `transferOwnership`, `archiveWorkspace`, `unarchiveWorkspace` |

Everything else that is workspace-scoped (`workspace.getById`, `getTeamPanelData`, `getWorkspaceUsage`, `cloneWorkspace`, `invitations.list`, `listInviteLinks`, `cancel`, `permissions.listRoles`, `apiKeys.list`, analytics with `organizationId`) only requires membership.

The UI also reads `currentWorkspace.role.permissions` directly in a few places, e.g. `components/workspace/workspace-settings.tsx` checks `*` or `workspace:update`. UI checks are cosmetic; the server check is what counts.

## Default roles

`workspace.create` and `workspace.ensureDefault` create four system roles (`isSystem: true`, cannot be edited or deleted):

| Role | Permissions |
|------|-------------|
| Owner | `*` |
| Admin | `member:read`, `member:create`, `member:update`, `member:delete`, `role:read`, `workspace:read`, `workspace:update` |
| Member | `member:read`, `workspace:read` |
| Viewer | `member:read`, `workspace:read` |

Consequence: with these defaults, Admin can only edit workspace settings. It cannot invite, change roles, remove members, manage roles or manage API keys, because none of `member:invite`, `member:manage`, `member:remove`, `role:*` or `settings:update` are in its list. Member and Viewer are identical. To make Admin useful, change the arrays in both places in `workspace.ts` (existing workspaces keep their stored roles).

`transferOwnership` demotes the old owner to the system role named `Admin`, creating one with `workspace:update`, `member:invite`, `member:manage`, `member:remove` if it does not exist.

`prisma/seed.ts` uses different strings again (`members:read`, `roles:create`, `api-keys:create`, ...), none of which the server checks.

## Vocabulary mismatch

There are three permission vocabularies in the repo. Only the strings in the table above are enforced.

| Source | Strings | Used by |
|--------|---------|---------|
| `lib/permissions/constants.ts` (authoritative for new code) | `workspace:view/update/delete`, `member:view/invite/manage/remove`, `role:view/create/update/delete`, `content:*`, `settings:view/update`, `*` | `checker.ts`, the permission browser and role editor UI |
| `lib/rbac/permissions.ts` (legacy) | `workspace:read/manage`, `member:read/update`, `resource:*`, `admin:*`, plus its own `DEFAULT_ROLES` | Only the `Permission` type in `components/rbac/permission-guard.tsx` |
| Seeded/default role arrays | `*:read`, `member:create/delete`, `members:*`, `roles:*` | Stored in the DB, mostly unchecked |

Use `lib/permissions/constants.ts` for new checks and role editors. Do not rely on `lib/rbac/permissions.ts`.

`PermissionGuard` (`components/rbac/permission-guard.tsx`) is not usable as is: it reads from `hooks/use-permissions.ts`, which always returns an empty array, so it always renders the fallback. It is not used anywhere. For UI gating, check `useWorkspace().currentWorkspace.role.permissions` with `hasPermission` from `lib/permissions/checker.ts`.

## Common tasks

**Add a new permission**
1. Add it to `PERMISSIONS` and `PERMISSION_DEFINITIONS` in `lib/permissions/constants.ts` (it then appears in the role editor).
2. Check it in the procedure with `permits(toPermissions(membership.role.permissions), '...')`.
3. Add it to the default role arrays in `workspace.create` and `workspace.ensureDefault` if built-in roles should have it.

**Custom roles**: `permissions.createRole({ organizationId, name, description?, permissions })` and `updateRole({ id, ...})`. Permission strings are not validated against the constants list.

**Change a member's role**: `workspace.updateMemberRole({ organizationId, userId, roleId })`. The role must belong to the same workspace.

## Ownership rules

- A workspace can have several members with `*` roles; all count as owners.
- `updateMemberRole`, `removeMember` and `bulkRemoveMembers` refuse to leave a workspace with zero owners. `scripts/check-rbac.ts` covers this.
- `bulkUpdateMemberRoles` blocks changing your own role but does not check the last-owner rule.
- Only owners can delete, archive, unarchive or transfer ownership.

## Gotchas

- A caller with `role:create` can create a role containing `*`, and a caller with `member:manage` can assign any workspace role, including Owner, to any member, themselves included (`updateMemberRole` has no self check). Treat `member:manage` and `role:*` as owner-equivalent.
- Invitations take a `roleId` that is not checked against the workspace or against the inviter's own role. See [workspaces.md](workspaces.md).
- `pnpm test:rbac` runs against the database in `DATABASE_URL`. Point it at a local or CI database, never production.

Related: [workspaces.md](workspaces.md), [api.md](api.md), [admin.md](admin.md).
