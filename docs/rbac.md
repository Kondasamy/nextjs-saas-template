# RBAC & Permissions

Role-Based Access Control (RBAC) system with granular permissions for enterprise-grade security.

## Overview

The RBAC system provides:
- **Flexible role definitions** with custom permissions
- **Granular permission checks** at UI and API levels
- **Permission inheritance** and wildcards
- **Visual permission management** interface
- **Audit logging** for permission changes

## Default Roles

### Owner
- Full access (`*` permission)
- Cannot be deleted or modified
- Automatically assigned to workspace creator

### Admin
- Workspace management
- Member management
- Settings management
- Cannot delete workspace

### Member
- Read and create resources
- Update own resources
- Basic workspace access

### Viewer
- Read-only access
- Cannot modify any resources

## Permission Structure

Permissions follow a `resource:action` format:

```typescript
// Format: resource:action
'workspace:read'
'workspace:update'
'member:invite'
'settings:manage'
```

### Permission Categories

```typescript
// Admin Permissions
'admin:access'        // Access admin panel
'admin:users'         // Manage users
'admin:system'        // System settings

// Workspace Permissions
'workspace:read'      // View workspace
'workspace:update'    // Edit workspace settings
'workspace:delete'    // Delete workspace
'workspace:archive'   // Archive/unarchive

// Member Permissions
'member:read'         // View members
'member:invite'       // Invite new members
'member:remove'       // Remove members
'member:update_role'  // Change member roles

// Role Permissions
'role:read'          // View roles
'role:create'        // Create custom roles
'role:update'        // Edit roles
'role:delete'        // Delete roles

// Settings Permissions
'settings:read'      // View settings
'settings:update'    // Update settings
```

## Using Permissions

### UI Components

#### Permission Guard

Conditionally render UI based on permissions:

```tsx
import { PermissionGuard } from '@/components/rbac/permission-guard'

<PermissionGuard permission="member:invite">
  <Button>Invite Member</Button>
</PermissionGuard>

// Multiple permissions (ANY)
<PermissionGuard permissions={['workspace:update', 'admin:access']}>
  <SettingsForm />
</PermissionGuard>

// Multiple permissions (ALL)
<PermissionGuard
  permissions={['member:invite', 'member:remove']}
  requireAll
>
  <MemberManagement />
</PermissionGuard>
```

#### Fallback UI

Show alternative content for unauthorized users:

```tsx
<PermissionGuard
  permission="workspace:delete"
  fallback={<Text>You don't have permission to delete</Text>}
>
  <DeleteButton />
</PermissionGuard>
```

### API Level

#### tRPC Procedures

Check permissions in tRPC procedures:

```typescript
import { hasPermission } from '@/lib/permissions/checker'

export const updateWorkspace = protectedProcedure
  .input(z.object({
    workspaceId: z.string(),
    data: z.object({...})
  }))
  .mutation(async ({ ctx, input }) => {
    // Check permission
    const canUpdate = await hasPermission(
      ctx.user.id,
      input.workspaceId,
      'workspace:update'
    )

    if (!canUpdate) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Permission denied'
      })
    }

    // Proceed with update
    return ctx.prisma.workspace.update({...})
  })
```

#### Bulk Permission Check

Check multiple permissions efficiently:

```typescript
const permissions = await hasPermissions(
  userId,
  workspaceId,
  ['workspace:update', 'member:invite', 'role:create']
)

// Returns object with permission results
{
  'workspace:update': true,
  'member:invite': false,
  'role:create': true
}
```

## Custom Roles

### Creating Roles

```typescript
// Via UI
// Navigate to /workspace/roles
// Click "Create Role"
// Select permissions
// Save

// Via API
const role = await trpc.permissions.createRole.mutate({
  workspaceId: 'workspace_123',
  name: 'Content Manager',
  description: 'Manages content and publications',
  permissions: [
    'content:read',
    'content:create',
    'content:update',
    'content:publish'
  ]
})
```

### Updating Roles

```typescript
await trpc.permissions.updateRole.mutate({
  roleId: 'role_123',
  permissions: ['content:read', 'content:update']
})
```

### Role Assignment

```typescript
// Assign role to member
await trpc.workspace.updateMemberRole.mutate({
  memberId: 'member_123',
  roleId: 'role_456'
})

// Bulk update roles
await trpc.workspace.bulkUpdateMemberRoles.mutate({
  memberIds: ['member_1', 'member_2'],
  roleId: 'role_789'
})
```

## Permission Management UI

### Permission Browser

Visual interface for managing permissions:

```tsx
import { PermissionBrowser } from '@/components/rbac/permission-browser'

<PermissionBrowser
  selectedPermissions={role.permissions}
  onChange={(permissions) => updateRole(permissions)}
  showCategories={true}
/>
```

### Role Editor Dialog

Complete role management interface:

```tsx
import { RoleEditorDialog } from '@/components/rbac/role-editor-dialog'

<RoleEditorDialog
  role={existingRole}
  workspaceId={workspaceId}
  onSave={handleSave}
/>
```

## Advanced Features

### Wildcard Permissions

Use wildcards for broad access:

```typescript
// All workspace permissions
'workspace:*'

// All permissions (super admin)
'*'

// Check wildcard permission
hasPermission(userId, workspaceId, 'workspace:*')
```

### Permission Inheritance

Permissions can inherit from parent resources:

```typescript
// If user has 'workspace:*', they implicitly have:
// - workspace:read
// - workspace:update
// - workspace:delete
// etc.
```

### Dynamic Permissions

Create context-aware permissions:

```typescript
// Check if user owns the resource
const isOwner = resource.createdById === userId

// Apply owner-specific permissions
if (isOwner) {
  permissions.push('resource:delete')
}
```

## Permission Helpers

### Check User Permissions

```typescript
import { getUserPermissions } from '@/lib/permissions/checker'

// Get all user permissions
const permissions = await getUserPermissions(
  userId,
  workspaceId
)
// Returns: ['workspace:read', 'member:invite', ...]
```

### Check Role Permissions

```typescript
import { getRolePermissions } from '@/lib/permissions/checker'

// Get role permissions
const permissions = await getRolePermissions(roleId)
// Returns: ['content:create', 'content:update', ...]
```

### Permission Utilities

```typescript
import {
  canUserPerform,
  hasAnyPermission,
  hasAllPermissions
} from '@/lib/permissions/utils'

// Single permission check
const canEdit = await canUserPerform(
  userId,
  'workspace:update'
)

// Any permission
const canManage = await hasAnyPermission(
  userId,
  ['admin:access', 'workspace:update']
)

// All permissions
const isFullAdmin = await hasAllPermissions(
  userId,
  ['admin:access', 'admin:users', 'admin:system']
)
```

## Best Practices

### 1. Granular Permissions

Create specific permissions rather than broad ones:

```typescript
// Good
'invoice:create'
'invoice:view_own'
'invoice:view_all'

// Avoid
'invoice:manage' // Too broad
```

### 2. Permission Naming

Use consistent naming conventions:

```typescript
// Pattern: resource:action
'user:create'
'user:read'
'user:update'
'user:delete'
```

### 3. Default Deny

Always default to denying access:

```typescript
// Check permission explicitly
if (!hasPermission(user, 'action')) {
  throw new Error('Access denied')
}
```

### 4. Audit Logging

Log permission changes:

```typescript
await createAuditLog({
  action: 'permission.updated',
  userId,
  metadata: {
    roleId,
    addedPermissions,
    removedPermissions
  }
})
```

## Security Considerations

1. **Never trust client-side checks alone** - Always verify on server
2. **Cache permissions carefully** - Invalidate on changes
3. **Audit all permission changes** - Maintain compliance
4. **Use least privilege principle** - Grant minimum required access
5. **Regular permission reviews** - Audit role assignments

## Next Steps

- Implement [Workspace Management](./workspaces.md)
- Configure [Admin Features](./admin.md)
- Review [API Documentation](./api.md)