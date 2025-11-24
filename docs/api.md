# API Reference

Complete API documentation for tRPC routers and REST endpoints.

## tRPC Overview

This template uses tRPC for end-to-end type-safe APIs.

### Client Usage

```typescript
// Client components
'use client'
import { trpc } from '@/lib/trpc/client'

const { data, isLoading } = trpc.user.getCurrent.useQuery()
const mutation = trpc.user.update.useMutation()
```

### Server Usage

```typescript
// Server components
import { createServerCaller } from '@/lib/trpc/server'

const caller = await createServerCaller()
const data = await caller.user.getCurrent()
```

## Available Routers

### User Router

```typescript
// server/api/routers/user.ts

// Get current user
trpc.user.getCurrent.useQuery()

// Update user profile
trpc.user.update.useMutation({
  name: 'John Doe',
  bio: 'Software Developer'
})

// Update profile with avatar
trpc.user.updateProfile.useMutation({
  name: 'John Doe',
  avatarUrl: 'https://...'
})

// Export account data (GDPR)
trpc.user.exportAccountData.useQuery()

// Get activity log
trpc.user.getUserActivityLog.useQuery({
  limit: 50,
  offset: 0
})
```

### Workspace Router

```typescript
// server/api/routers/workspace.ts

// Create workspace
trpc.workspace.create.useMutation({
  name: 'My Workspace',
  slug: 'my-workspace'
})

// Update workspace
trpc.workspace.update.useMutation({
  workspaceId: 'ws_123',
  data: {
    name: 'Updated Name',
    description: 'New description'
  }
})

// Clone workspace
trpc.workspace.cloneWorkspace.useMutation({
  sourceWorkspaceId: 'ws_123',
  name: 'Cloned Workspace',
  slug: 'cloned'
})

// Archive workspace
trpc.workspace.archiveWorkspace.useMutation({
  workspaceId: 'ws_123',
  confirmName: 'My Workspace'
})

// Restore archived workspace
trpc.workspace.unarchiveWorkspace.useMutation({
  workspaceId: 'ws_123'
})

// Get workspace usage metrics
trpc.workspace.getWorkspaceUsage.useQuery({
  workspaceId: 'ws_123'
})

// Bulk update member roles
trpc.workspace.bulkUpdateMemberRoles.useMutation({
  workspaceId: 'ws_123',
  memberIds: ['m_1', 'm_2'],
  roleId: 'role_admin'
})

// Bulk remove members
trpc.workspace.bulkRemoveMembers.useMutation({
  workspaceId: 'ws_123',
  memberIds: ['m_1', 'm_2']
})
```

### Permissions Router

```typescript
// server/api/routers/permissions.ts

// List all roles
trpc.permissions.listRoles.useQuery({
  workspaceId: 'ws_123'
})

// Create custom role
trpc.permissions.createRole.useMutation({
  workspaceId: 'ws_123',
  name: 'Content Manager',
  description: 'Manages content',
  permissions: [
    'content:read',
    'content:create',
    'content:update'
  ]
})

// Update role permissions
trpc.permissions.updateRole.useMutation({
  roleId: 'role_123',
  permissions: ['workspace:read', 'member:invite']
})

// Delete role
trpc.permissions.deleteRole.useMutation({
  roleId: 'role_123'
})
```

### Invitations Router

```typescript
// server/api/routers/invitations.ts

// Create email invitation
trpc.invitations.create.useMutation({
  workspaceId: 'ws_123',
  email: 'user@example.com',
  roleId: 'role_member'
})

// Create shareable invite link
trpc.invitations.createInviteLink.useMutation({
  workspaceId: 'ws_123',
  roleId: 'role_member',
  maxUses: 10, // Optional
  expiresInDays: 7 // Optional
})

// List invite links
trpc.invitations.listInviteLinks.useQuery({
  workspaceId: 'ws_123'
})

// Revoke invite link
trpc.invitations.revokeInviteLink.useMutation({
  linkId: 'link_123'
})

// Accept invitation
trpc.invitations.acceptInviteLink.useMutation({
  token: 'invite_token'
})

// Bulk invite members
trpc.invitations.bulkInviteMembers.useMutation({
  workspaceId: 'ws_123',
  emails: ['user1@example.com', 'user2@example.com'],
  roleId: 'role_member'
})
```

### Notifications Router

```typescript
// server/api/routers/notifications.ts

// List notifications
trpc.notifications.list.useQuery({
  unreadOnly: true
})

// Mark as read
trpc.notifications.markAsRead.useMutation({
  notificationId: 'notif_123'
})

// Mark all as read
trpc.notifications.markAllAsRead.useMutation()

// Delete notification
trpc.notifications.delete.useMutation({
  notificationId: 'notif_123'
})
```

### Storage Router

```typescript
// server/api/routers/storage.ts

// Get upload URL
const { uploadUrl, fileUrl } = await trpc.storage.getUploadUrl.mutate({
  bucket: 'avatars',
  path: 'user_123/avatar.jpg'
})

// Upload file
await fetch(uploadUrl, {
  method: 'PUT',
  body: file
})

// Get public URL
const { url } = await trpc.storage.getPublicUrl.query({
  bucket: 'avatars',
  path: 'user_123/avatar.jpg'
})
```

### Analytics Router

```typescript
// server/api/routers/analytics.ts

// Get dashboard stats
trpc.analytics.getStats.useQuery()

// Get user growth data
trpc.analytics.getUserGrowth.useQuery({
  days: 30 // 7, 30, 60, 90
})

// Get activity metrics
trpc.analytics.getActivityMetrics.useQuery()

// Get recent activities
trpc.analytics.getRecentActivities.useQuery({
  limit: 20
})
```

### Admin Router

```typescript
// server/api/routers/admin.ts

// Get all users
trpc.admin.getAllUsers.useQuery({
  search: 'john',
  limit: 50,
  offset: 0
})

// Get system statistics
trpc.admin.getSystemStats.useQuery()

// Get audit logs
trpc.admin.getAuditLogs.useQuery({
  action: 'user.login',
  limit: 100,
  offset: 0
})

// Delete user
trpc.admin.deleteUser.useMutation({
  userId: 'user_123',
  confirmEmail: 'user@example.com'
})

// Update user status (ban/unban)
trpc.admin.updateUserStatus.useMutation({
  userId: 'user_123',
  banned: true
})
```

### Theme Router

```typescript
// server/api/routers/theme.ts

// Get available themes
trpc.theme.getAvailableThemes.useQuery()

// Get active theme
trpc.theme.getActiveTheme.useQuery()

// Set active theme
trpc.theme.setActiveTheme.useMutation({
  themeId: 'ocean'
})
```

### Maintenance Router

```typescript
// server/api/routers/maintenance.ts

// Get maintenance status
trpc.maintenance.getStatus.useQuery()

// Enable maintenance mode
trpc.maintenance.enable.useMutation({
  message: 'Scheduled maintenance',
  endTime: new Date('2024-01-01T12:00:00Z')
})

// Disable maintenance mode
trpc.maintenance.disable.useMutation()
```

### API Keys Router

```typescript
// server/api/routers/apiKeys.ts

// List API keys
trpc.apiKeys.list.useQuery({
  workspaceId: 'ws_123'
})

// Create API key
const { key, keyId } = await trpc.apiKeys.create.mutate({
  workspaceId: 'ws_123',
  name: 'Production Key',
  expiresIn: '90d' // 7d, 30d, 90d, 365d, never
})

// Revoke API key
trpc.apiKeys.revoke.useMutation({
  keyId: 'key_123'
})

// Validate API key
trpc.apiKeys.validate.useQuery({
  key: 'sk_live_...'
})
```

### Feedback Router

```typescript
// server/api/routers/feedback.ts

// Submit feedback
trpc.feedback.submitFeedback.useMutation({
  type: 'bug', // bug, feature, improvement
  message: 'Found an issue...',
  metadata: {
    page: '/dashboard',
    browser: 'Chrome'
  }
})

// Submit support request
trpc.feedback.submitSupport.useMutation({
  subject: 'Need help',
  message: 'How do I...',
  priority: 'high' // low, medium, high
})
```

## REST API Endpoints

### Authentication

```typescript
// Better Auth endpoints
POST   /api/auth/sign-up
POST   /api/auth/sign-in
POST   /api/auth/sign-out
GET    /api/auth/session
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-email
POST   /api/auth/change-password
GET    /api/auth/oauth/google
GET    /api/auth/oauth/github
GET    /api/auth/oauth/microsoft
```

### Email Preview

```typescript
// Development only
GET /api/email/preview?template=welcome
GET /api/email/preview?template=verification
GET /api/email/preview?template=password-reset
GET /api/email/preview?template=magic-link
GET /api/email/preview?template=invitation
GET /api/email/preview?template=two-factor
```

### Admin Impersonation

```typescript
// Start impersonation
POST /api/admin/impersonation/start
Body: { targetUserId: 'user_123' }

// Stop impersonation
POST /api/admin/impersonation/stop
```

### Theme

```typescript
// Get active theme CSS
GET /api/theme
```

## Error Handling

### tRPC Errors

```typescript
import { TRPCError } from '@trpc/server'

throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'You must be logged in'
})

// Error codes:
// BAD_REQUEST
// UNAUTHORIZED
// FORBIDDEN
// NOT_FOUND
// TIMEOUT
// CONFLICT
// PRECONDITION_FAILED
// PAYLOAD_TOO_LARGE
// UNPROCESSABLE_CONTENT
// TOO_MANY_REQUESTS
// INTERNAL_SERVER_ERROR
```

### Client Error Handling

```typescript
const mutation = trpc.user.update.useMutation({
  onError: (error) => {
    if (error.code === 'UNAUTHORIZED') {
      router.push('/login')
    }
    toast.error(error.message)
  },
  onSuccess: (data) => {
    toast.success('Updated successfully')
  }
})
```

## Rate Limiting

API endpoints are rate limited:

```typescript
// Default: 100 requests per 15 minutes
await checkRateLimit()

// Strict: 10 requests per 15 minutes
await checkRateLimit(strictRateLimiter)

// Auth: 5 attempts per 15 minutes
await checkRateLimit(authRateLimiter)
```

## Authentication

### Protected Procedures

```typescript
// Require authentication
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    const session = await getAuthSession()
    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }
    return next({
      ctx: {
        ...ctx,
        session,
        user: session.user
      }
    })
  })
```

### Admin Procedures

```typescript
// Require admin access
export const adminProcedure = protectedProcedure
  .use(async ({ ctx, next }) => {
    if (!isUserAdmin(ctx.user.email)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required'
      })
    }
    return next({ ctx })
  })
```

## Optimistic Updates

```typescript
const utils = trpc.useUtils()

const mutation = trpc.user.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await utils.user.getCurrent.cancel()

    // Get current data
    const previousData = utils.user.getCurrent.getData()

    // Optimistically update
    utils.user.getCurrent.setData(undefined, {
      ...previousData,
      ...newData
    })

    return { previousData }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.user.getCurrent.setData(
      undefined,
      context?.previousData
    )
  },
  onSettled: () => {
    // Refetch after success or error
    utils.user.getCurrent.invalidate()
  }
})
```

## Batch Operations

```typescript
// Batch multiple queries
const results = await Promise.all([
  caller.user.getCurrent(),
  caller.workspace.list(),
  caller.notifications.list()
])

// Using tRPC batch
const [user, workspaces, notifications] = await trpc.batch([
  trpc.user.getCurrent.query(),
  trpc.workspace.list.query(),
  trpc.notifications.list.query()
])
```

## WebSocket Support

For real-time features with Supabase:

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'Notification',
      filter: `userId=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
      utils.notifications.list.invalidate()
    }
  )
  .subscribe()
```

## Testing

### Unit Tests

```typescript
import { createCaller } from '@/server/api/routers/_app'

describe('User Router', () => {
  it('should get current user', async () => {
    const caller = createCaller({
      session: mockSession,
      prisma: mockPrisma
    })

    const user = await caller.user.getCurrent()
    expect(user).toBeDefined()
  })
})
```

### Integration Tests

```typescript
import { createServerCaller } from '@/lib/trpc/server'

test('Full user flow', async () => {
  const caller = await createServerCaller()

  // Create user
  const user = await caller.auth.signUp({
    email: 'test@example.com',
    password: 'password123'
  })

  // Update profile
  await caller.user.update({
    name: 'Test User'
  })

  // Verify update
  const updated = await caller.user.getCurrent()
  expect(updated.name).toBe('Test User')
})
```

## Next Steps

- Configure [Deployment](./deployment.md)
- Understand [Architecture](./architecture.md)
- Review [Getting Started](./getting-started.md)