# Admin Dashboard

Comprehensive admin panel for system management and user support.

## Overview

The admin dashboard provides:
- **User management** with search and actions
- **System statistics** and metrics
- **Audit logs** with filtering
- **User impersonation** for support
- **Maintenance mode** control
- **Theme management** system

## Access Control

### Configuration

Set admin emails in environment:

```env
ADMIN_EMAILS="admin@example.com,manager@example.com"
```

### Access Check

Admin routes are protected:

```typescript
// lib/auth/admin-helpers.ts
export async function requireAdmin() {
  const { user } = await getAuthSession()

  if (!isUserAdmin(user?.email)) {
    redirect('/')
  }

  return { user }
}
```

## User Management

### Users Table

Located at `/admin/users`:

```tsx
// components/admin/users-table.tsx
<UsersTable
  users={users}
  onBan={handleBan}
  onDelete={handleDelete}
  onImpersonate={handleImpersonate}
/>
```

### Features

#### Search & Filter

```typescript
const users = await trpc.admin.getAllUsers.query({
  search: 'john', // Search by name or email
  limit: 50,
  offset: 0,
  filter: {
    banned: false,
    verified: true
  }
})
```

#### User Actions

```typescript
// Ban/unban user
await trpc.admin.updateUserStatus.mutate({
  userId: 'user_123',
  banned: true
})

// Delete user (with cascade)
await trpc.admin.deleteUser.mutate({
  userId: 'user_123',
  confirmEmail: 'user@example.com' // Safety check
})
```

## User Impersonation

### Starting Impersonation

```typescript
// Via UI: Click menu → "Impersonate User"

// Via API:
import { startImpersonation } from '@/lib/auth/impersonation'

await startImpersonation(adminId, userId)
```

### Features

- **1-hour session limit** for security
- **Visual banner** shows when impersonating
- **Audit logging** of all actions
- **Quick exit** button in banner

### Impersonation Banner

```tsx
// components/admin/impersonation-banner.tsx
// Automatically shown when impersonating
<ImpersonationBanner
  targetUser={user}
  onExit={handleExit}
/>
```

### Security

All impersonation actions are logged:

```typescript
{
  action: 'admin.impersonation.start',
  adminId: 'admin_123',
  targetUserId: 'user_456',
  targetUserEmail: 'user@example.com',
  sessionId: 'session_789',
  expiresAt: '2024-01-01T12:00:00Z'
}
```

## System Statistics

### Dashboard Metrics

Located at `/admin`:

```typescript
const stats = await trpc.admin.getSystemStats.query()

// Returns:
{
  totalUsers: 1234,
  totalOrganizations: 56,
  totalMembers: 2345,
  recentSignups: 45, // Last 30 days
  activeUsers: 890, // Last 7 days
  growthRate: 12.5 // Percentage
}
```

### Statistics Cards

```tsx
import { StatsCard } from '@/components/admin/stats-card'

<StatsCard
  title="Total Users"
  value={stats.totalUsers}
  change={stats.userGrowth}
  icon={<Users />}
/>
```

## Audit Logs

### Viewing Logs

Located at `/admin/audit`:

```typescript
const logs = await trpc.admin.getAuditLogs.query({
  action: 'user.login', // Optional filter
  userId: 'user_123', // Optional filter
  limit: 100,
  offset: 0,
  dateRange: {
    from: startDate,
    to: endDate
  }
})
```

### Log Entry Structure

```typescript
interface AuditLog {
  id: string
  action: string // e.g., 'user.login'
  userId: string
  user: User // Populated user data
  ipAddress?: string
  userAgent?: string
  metadata?: JsonValue // Additional data
  createdAt: Date
}
```

### Available Actions

Common audit log actions:

- `user.login` - User sign in
- `user.logout` - User sign out
- `user.signup` - New registration
- `user.password.reset` - Password reset
- `workspace.create` - Workspace creation
- `workspace.update` - Settings change
- `member.invite` - Member invitation
- `member.remove` - Member removal
- `admin.impersonation.start` - Impersonation start
- `admin.impersonation.end` - Impersonation end

### Export Functionality

```typescript
// Export logs as CSV
const csv = await trpc.admin.exportAuditLogs.query({
  format: 'csv',
  filters: { /* same as query */ }
})

// Download CSV
const blob = new Blob([csv], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
downloadFile(url, 'audit-logs.csv')
```

## Maintenance Mode

### Control Panel

Located at `/admin/maintenance`:

```tsx
// components/admin/maintenance-manager.tsx
<MaintenanceManager
  currentStatus={status}
  onUpdate={handleUpdate}
/>
```

### Enabling Maintenance

```typescript
await trpc.maintenance.enable.mutate({
  message: 'Scheduled maintenance in progress',
  endTime: new Date('2024-01-01T12:00:00Z') // Optional
})
```

### Features

- **Custom message** display
- **Scheduled end time** with countdown
- **Auto-disable** at end time
- **Site-wide banner** display
- **Audit logging** of changes

### Maintenance Banner

```tsx
// components/maintenance-banner-wrapper.tsx
// Automatically shown when maintenance is active
<MaintenanceBannerWrapper />
```

## Theme Management

### Theme Switcher

Located at `/admin/themes`:

```tsx
// components/admin/theme-manager.tsx
<ThemeManager
  themes={availableThemes}
  activeTheme={currentTheme}
  onThemeChange={handleThemeChange}
/>
```

### Available Themes

```typescript
const themes = await trpc.theme.getAvailableThemes.query()

// Returns:
[
  { id: 'default', name: 'Default', description: 'Neutral slate' },
  { id: 'bubblegum', name: 'Bubblegum', description: 'Pink and purple' },
  { id: 'ocean', name: 'Ocean', description: 'Blue and teal' },
  { id: 'forest', name: 'Forest', description: 'Green earth tones' }
]
```

### Setting Active Theme

```typescript
await trpc.theme.setActiveTheme.mutate({
  themeId: 'ocean'
})
```

### Adding Custom Themes

1. Create CSS file in `themes/`:

```css
/* themes/custom.css */
:root {
  --background: 210 40% 98%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}
```

2. Register in config:

```typescript
// lib/theme/config.ts
export const AVAILABLE_THEMES = [
  // ... existing themes
  {
    id: 'custom',
    name: 'Custom Theme',
    description: 'Your custom theme'
  }
]
```

## Admin Components

### Admin Layout

```tsx
// app/(admin)/admin/layout.tsx
export default async function AdminLayout({ children }) {
  await requireAdmin() // Access control

  return (
    <div>
      <AdminHeader />
      <AdminSidebar />
      {children}
    </div>
  )
}
```

### Admin Navigation

```tsx
const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/admin/users', label: 'Users', icon: <Users /> },
  { href: '/admin/audit', label: 'Audit Logs', icon: <FileText /> },
  { href: '/admin/themes', label: 'Themes', icon: <Palette /> },
  { href: '/admin/maintenance', label: 'Maintenance', icon: <Settings /> }
]
```

## Admin API

### tRPC Router

```typescript
// server/api/routers/admin.ts
export const adminRouter = router({
  // Users
  getAllUsers: protectedProcedure.query(),
  deleteUser: protectedProcedure.mutation(),
  updateUserStatus: protectedProcedure.mutation(),

  // System
  getSystemStats: protectedProcedure.query(),
  getAuditLogs: protectedProcedure.query(),
  exportAuditLogs: protectedProcedure.query(),

  // Settings
  getSystemSettings: protectedProcedure.query(),
  updateSystemSettings: protectedProcedure.mutation()
})
```

### Usage in Components

```tsx
'use client'

import { trpc } from '@/lib/trpc/client'

export function AdminDashboard() {
  const { data: stats } = trpc.admin.getSystemStats.useQuery()
  const { data: users } = trpc.admin.getAllUsers.useQuery()

  return (
    <div>
      {/* Dashboard content */}
    </div>
  )
}
```

## Security Considerations

### 1. Access Control

- Environment-based admin list
- Server-side verification
- Audit all admin actions
- Session-based access

### 2. Impersonation Safety

- Time-limited sessions
- Visual indicators
- Complete audit trail
- No password access

### 3. Data Protection

- Read-only by default
- Confirmation for destructive actions
- Rate limiting on admin endpoints
- IP logging for all actions

## Best Practices

### 1. Audit Everything

```typescript
await createAuditLog({
  action: 'admin.action',
  userId: adminId,
  metadata: {
    targetId,
    changes,
    reason
  }
})
```

### 2. Require Confirmation

```typescript
// Require typing email/name for dangerous actions
if (confirmEmail !== user.email) {
  throw new Error('Confirmation failed')
}
```

### 3. Time Limits

```typescript
// Set expiration on temporary access
const expires = new Date()
expires.setHours(expires.getHours() + 1)
```

### 4. Visual Feedback

```typescript
// Clear indicators for admin mode
<Badge variant="destructive">Admin Mode</Badge>
```

## Monitoring & Alerts

### Activity Monitoring

```typescript
// Monitor suspicious activity
const suspiciousActivity = await detectAnomalies({
  failedLogins: 10,
  timeWindow: '15m'
})

if (suspiciousActivity) {
  await sendAdminAlert(activity)
}
```

### System Health

```typescript
// Regular health checks
const health = await checkSystemHealth()

if (!health.healthy) {
  await notifyAdmins(health.issues)
}
```

## Next Steps

- Review [API Documentation](./api.md)
- Configure [Deployment](./deployment.md)
- Understand [Architecture](./architecture.md)