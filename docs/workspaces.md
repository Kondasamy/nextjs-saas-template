# Workspace Management

Multi-tenant workspace system with comprehensive management features.

## Overview

Workspaces provide:
- **Data isolation** between organizations
- **Member management** with roles
- **Invitation system** with multiple methods
- **Archive/restore** functionality
- **Template cloning** for quick setup
- **Usage metrics** and analytics

## Core Concepts

### Workspace Model

```typescript
interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  archived: boolean
  archivedAt?: Date
  archivedBy?: string
  createdAt: Date
  updatedAt: Date
}
```

### Member Roles

Each workspace member has a role:
- **Owner** - Full control
- **Admin** - Management access
- **Member** - Standard access
- **Viewer** - Read-only access

## Creating Workspaces

### Via UI

```tsx
// Navigate to /workspaces/new
// Or use the WorkspaceCreator component
import { WorkspaceCreator } from '@/components/workspace/workspace-creator'

<WorkspaceCreator
  onSuccess={(workspace) => {
    router.push(`/workspace/${workspace.id}`)
  }}
/>
```

### Via API

```typescript
const workspace = await trpc.workspace.create.mutate({
  name: 'My Company',
  slug: 'my-company',
  description: 'Company workspace'
})
```

## Member Management

### Inviting Members

#### Email Invitations

```typescript
// Single invitation
await trpc.invitations.create.mutate({
  workspaceId: 'workspace_123',
  email: 'user@example.com',
  roleId: 'role_member'
})

// Bulk invitations
await trpc.invitations.bulkInviteMembers.mutate({
  workspaceId: 'workspace_123',
  emails: [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ],
  roleId: 'role_member'
})
```

#### Invitation Links

Create shareable invitation links:

```typescript
// Create invitation link
const link = await trpc.invitations.createInviteLink.mutate({
  workspaceId: 'workspace_123',
  roleId: 'role_member',
  maxUses: 10, // Optional: limit uses
  expiresInDays: 7 // Optional: expiration
})

// Share link: https://yourapp.com/invite/[token]

// List active links
const links = await trpc.invitations.listInviteLinks.query({
  workspaceId: 'workspace_123'
})

// Revoke link
await trpc.invitations.revokeInviteLink.mutate({
  linkId: 'link_123'
})
```

### Managing Members

#### View Members

```typescript
const members = await trpc.workspace.getMembers.query({
  workspaceId: 'workspace_123'
})
```

#### Update Roles

```typescript
// Single member
await trpc.workspace.updateMemberRole.mutate({
  memberId: 'member_123',
  roleId: 'role_admin'
})

// Bulk update
await trpc.workspace.bulkUpdateMemberRoles.mutate({
  memberIds: ['member_1', 'member_2'],
  roleId: 'role_viewer'
})
```

#### Remove Members

```typescript
// Single removal
await trpc.workspace.removeMember.mutate({
  memberId: 'member_123'
})

// Bulk removal
await trpc.workspace.bulkRemoveMembers.mutate({
  memberIds: ['member_1', 'member_2', 'member_3']
})
```

## Workspace Templates

### Cloning Workspaces

Clone an existing workspace with all settings:

```typescript
const cloned = await trpc.workspace.cloneWorkspace.mutate({
  sourceWorkspaceId: 'workspace_123',
  name: 'New Workspace',
  slug: 'new-workspace'
})

// Clones:
// - Workspace settings
// - Custom roles
// - Permissions
// - Configuration

// Does NOT clone:
// - Members
// - Invitations
// - Activity history
// - Data
```

### Template Management

```typescript
// Save as template
const template = await trpc.workspace.saveAsTemplate.mutate({
  workspaceId: 'workspace_123',
  templateName: 'Sales Team Template',
  description: 'Template for sales teams'
})

// Create from template
const workspace = await trpc.workspace.createFromTemplate.mutate({
  templateId: 'template_123',
  name: 'Sales Team West',
  slug: 'sales-west'
})
```

## Archive & Restore

### Archiving Workspaces

Archive workspaces instead of deleting:

```typescript
// Archive workspace
await trpc.workspace.archiveWorkspace.mutate({
  workspaceId: 'workspace_123',
  confirmName: 'My Workspace' // Safety check
})

// List archived workspaces
const archived = await trpc.workspace.listArchived.query()

// Restore workspace
await trpc.workspace.unarchiveWorkspace.mutate({
  workspaceId: 'workspace_123'
})
```

### Archive Features

- Archived workspaces are hidden from UI
- Data is preserved
- Can be restored anytime
- Audit trail maintained
- Members retain access on restore

## API Key Management

### Creating API Keys

```typescript
const apiKey = await trpc.apiKeys.create.mutate({
  workspaceId: 'workspace_123',
  name: 'Production API Key',
  expiresIn: '90d' // 7d, 30d, 90d, 365d, never
})

// Returns full key only once
{
  key: 'sk_live_abc123...', // Store this securely
  keyId: 'key_123',
  lastFourChars: '1234'
}
```

### Managing API Keys

```typescript
// List API keys
const keys = await trpc.apiKeys.list.query({
  workspaceId: 'workspace_123'
})

// Revoke key
await trpc.apiKeys.revoke.mutate({
  keyId: 'key_123'
})

// Validate key
const valid = await trpc.apiKeys.validate.query({
  key: 'sk_live_abc123...'
})
```

## Usage Metrics

### Workspace Analytics

```typescript
const usage = await trpc.workspace.getWorkspaceUsage.query({
  workspaceId: 'workspace_123'
})

// Returns:
{
  memberCount: 25,
  activeMembersCount: 20, // Last 30 days
  pendingInvitationsCount: 3,
  activeInviteLinksCount: 2,
  recentActivityCount: 150, // Last 30 days
  activityRate: 85 // Percentage
}
```

### Activity Tracking

```typescript
// Get activity log
const activities = await trpc.workspace.getActivityLog.query({
  workspaceId: 'workspace_123',
  limit: 50,
  offset: 0
})

// Activity types tracked:
// - Member joined/left
// - Role changes
// - Settings updates
// - Resource creation/deletion
```

## Settings Management

### Basic Settings

```typescript
await trpc.workspace.update.mutate({
  workspaceId: 'workspace_123',
  data: {
    name: 'Updated Name',
    description: 'New description',
    logoUrl: 'https://...'
  }
})
```

### Advanced Settings

```typescript
// Workspace preferences
await trpc.workspace.updatePreferences.mutate({
  workspaceId: 'workspace_123',
  preferences: {
    defaultRole: 'role_member',
    requireEmailVerification: true,
    allowGuestAccess: false,
    autoArchiveAfterDays: 90
  }
})
```

## Workspace Switching

### UI Component

```tsx
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher'

// In navigation
<WorkspaceSwitcher
  currentWorkspaceId={workspace.id}
  onSwitch={(workspaceId) => {
    router.push(`/workspace/${workspaceId}`)
  }}
/>
```

### Context Provider

```tsx
import { WorkspaceProvider } from '@/contexts/workspace-context'

// Wrap your app
<WorkspaceProvider workspaceId={workspaceId}>
  <YourApp />
</WorkspaceProvider>

// Use in components
import { useWorkspace } from '@/contexts/workspace-context'

function Component() {
  const { workspace, members, permissions } = useWorkspace()
  // ...
}
```

## Best Practices

### 1. Data Isolation

Always filter by workspace:

```typescript
// Good
const data = await prisma.resource.findMany({
  where: {
    workspaceId: ctx.workspaceId,
    // other filters
  }
})

// Bad - leaks across workspaces
const data = await prisma.resource.findMany()
```

### 2. Permission Checks

Verify workspace access:

```typescript
const member = await prisma.organizationMember.findFirst({
  where: {
    userId: ctx.userId,
    organizationId: workspaceId
  }
})

if (!member) {
  throw new Error('Not a workspace member')
}
```

### 3. Invitation Security

- Use secure random tokens
- Set expiration on links
- Limit maximum uses
- Log invitation usage

### 4. Archive vs Delete

Prefer archiving over deletion:
- Preserves audit trail
- Enables recovery
- Maintains referential integrity
- Supports compliance requirements

## Migration Guide

### From Single to Multi-Workspace

1. Create default workspace
2. Migrate existing data
3. Update queries to include workspace filter
4. Add workspace switcher UI
5. Update permissions system

### Workspace Consolidation

1. Choose primary workspace
2. Export data from secondary
3. Import into primary
4. Archive secondary workspace
5. Reassign members

## Next Steps

- Configure [Email System](./emails.md)
- Set up [Admin Dashboard](./admin.md)
- Review [API Documentation](./api.md)