# Enterprise SaaS Template

A production-ready enterprise SaaS template built with Next.js 16, Prisma, Better Auth, Supabase, tRPC, and comprehensive RBAC.

## Features

- **Next.js 16** with App Router and React 19
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL (Supabase)
- **Better Auth** - Multiple authentication methods:
  - Email/password
  - OAuth (Google, GitHub, Microsoft)
  - Magic links
  - Passkeys (WebAuthn)
  - OTP (One-Time Password)
  - Two-Factor Authentication (2FA/TOTP)
  - Enterprise SSO (SAML, OKTA)
- **tRPC** for end-to-end type safety
- **Supabase** integration (optional):
  - PostgreSQL database
  - Storage for file uploads
  - Realtime subscriptions
  - Edge Functions support
- **RBAC System** with 6-30+ permission levels
- **Workspace Management** with multi-tenant architecture:
  - Workspace templates (clone workspaces with roles/permissions)
  - Workspace archiving (archive/restore with audit logging)
  - Invitation links (shareable links with usage limits)
  - Bulk member operations (invite/update/remove multiple members)
  - User activity history (paginated audit logs)
  - Workspace usage metrics (member activity, invitations, analytics)
- **Advanced Permission Management**:
  - Permission browser with categorized permissions
  - Role editor for custom roles
  - Granular permission system (workspace, member, role, content, settings)
  - Permission checker utilities
- **API Key Management**:
  - Secure API key generation with SHA-256 hashing
  - Key expiration (7, 30, 90, 365 days, or never)
  - Usage tracking (last used timestamp)
  - One-time key display on creation
- **Admin Dashboard**:
  - User management (search, ban/unban, delete)
  - User impersonation with audit logging
  - System statistics and metrics
  - Audit logs with filtering and CSV export
  - Environment-based admin access control
  - Maintenance mode banner (site-wide notifications with scheduled end times)
- **Analytics Dashboard**:
  - User growth charts (Recharts)
  - Activity metrics and feeds
  - Statistics cards with real-time data
  - Customizable time ranges (7-90 days)
- **Settings Pages** (5 complete pages):
  - Profile settings (avatar upload, bio, timezone, language)
  - Account settings (email change, password change, delete account)
  - Security settings (2FA, sessions, passkeys)
  - Team management (invite members, role assignment, pending invitations)
  - Notification preferences (7 categories with email/in-app toggles)
- **Email Infrastructure**:
  - Resend integration with Better Auth hooks
  - React Email templates (6 templates: welcome, verification, password-reset, magic-link, invitation, 2FA)
  - EmailService class for centralized email sending
  - Email preview route for development
  - Automatic email sending for all authentication flows
  - Welcome emails sent automatically after signup
  - Marketing email support (Mailchimp, Loops, ConvertKit)
- **In-app Notifications System**:
  - Notifications bell dropdown in page header with unread count badge
  - Real-time polling (30-second intervals) with toast alerts
  - Mark as read/delete individual notifications
  - Mark all as read functionality
  - Automatic notification refresh
  - Ready for Supabase Realtime upgrade
- **Internationalization (i18n)** with next-intl
- **ShadCN UI** component library (50+ components)
- **Tailwind CSS 4** for styling
- **Code Quality** with Biome and Oxlint
- **Production Ready**:
  - Error boundaries (global and page-level)
  - Loading skeletons with React Suspense
  - Rate limiting (3 tiers: default, strict, auth)
  - Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - Comprehensive error handling and recovery

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- PostgreSQL database (Supabase recommended)
- Supabase account (optional - required for storage and realtime features)
- Resend account (optional - for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourcompany/saas-template.git
cd saas-template
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in all required variables (see Environment Variables section).

4. Set up the database:
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or push schema directly (development only)
pnpm db:push
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.local.example` for all required environment variables. Key variables:

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (min 32 chars)
- `BETTER_AUTH_URL` - Your app URL
- `NEXT_PUBLIC_APP_URL` - Your application URL

### Optional

- `ADMIN_EMAILS` - Comma-separated list of admin email addresses (e.g., "admin@example.com,manager@example.com")
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (required for storage and realtime features)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (required for storage and realtime features)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (required for storage and realtime features)
- `RESEND_API_KEY` - Resend API key for emails
- `EMAIL_FROM_ADDRESS` - Email sender address
- `EMAIL_FROM_NAME` - Email sender name
- OAuth provider credentials (Google, GitHub, Microsoft)
- SSO credentials (SAML, OKTA)

## Project Structure

```
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── verify-email/
│   │   ├── verify-otp/
│   │   └── setup-2fa/
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── page.tsx               # Dashboard with analytics
│   │   ├── workspaces/
│   │   ├── notifications/
│   │   └── settings/              # Settings pages
│   │       ├── profile/           # Profile settings
│   │       ├── account/           # Account settings
│   │       ├── security/          # Security settings
│   │       ├── team/              # Team management
│   │       └── notifications/     # Notification preferences
│   ├── (admin)/                   # Admin route group
│   │   └── admin/                 # Admin dashboard
│   │       ├── layout.tsx         # Admin layout with access control
│   │       ├── page.tsx           # Admin dashboard (system stats)
│   │       ├── users/             # User management
│   │       ├── audit/             # Audit logs
│   │       ├── themes/            # Theme management
│   │       ├── maintenance/       # Maintenance mode
│   │       └── emails/            # Email templates
│   ├── api/                       # API routes
│   │   ├── auth/[...all]/         # Better Auth routes
│   │   ├── trpc/[trpc]/           # tRPC routes
│   │   └── email/preview/         # Email template preview (dev only)
│   └── layout.tsx                 # Root layout
├── components/                     # React components
│   ├── admin/                     # Admin components
│   │   ├── users-table.tsx        # User management table
│   │   ├── audit-log-table.tsx    # Audit log table
│   │   ├── impersonation-banner.tsx  # Impersonation warning banner
│   │   ├── theme-manager.tsx      # Theme management UI
│   │   └── maintenance-manager.tsx   # Maintenance mode controls
│   ├── maintenance-banner.tsx     # Site-wide maintenance banner
│   ├── maintenance-banner-wrapper.tsx  # Server component wrapper
│   ├── notifications/             # Notification components
│   │   └── notifications-dropdown.tsx  # Bell icon dropdown with full management
│   ├── analytics/                 # Analytics components
│   │   ├── stats-card.tsx         # Statistics card
│   │   ├── user-growth-chart.tsx  # User growth chart (Recharts)
│   │   └── activity-feed.tsx      # Activity feed
│   ├── settings/                  # Settings components
│   │   ├── profile-settings-form.tsx
│   │   ├── email-change-form.tsx
│   │   ├── password-change-form.tsx
│   │   ├── delete-account-form.tsx
│   │   ├── team-members-table.tsx
│   │   ├── invite-member-dialog.tsx
│   │   ├── pending-invitations.tsx
│   │   └── notification-preferences.tsx
│   ├── auth/                      # Authentication components
│   ├── workspace/                 # Workspace management
│   ├── rbac/                      # RBAC components
│   ├── notifications/             # Notification components
│   ├── upload/                    # File upload components
│   ├── user/                      # User components
│   └── ui/                        # ShadCN UI components (50+)
├── lib/                           # Utility functions
│   ├── auth/                      # Better Auth configuration
│   │   ├── config.ts              # Auth configuration
│   │   ├── auth-helpers.ts        # Auth helper functions
│   │   └── admin-helpers.ts       # Admin access control
│   ├── trpc/                      # tRPC client/server
│   ├── rbac/                      # RBAC utilities
│   ├── email/                     # Email utilities
│   │   └── service.ts             # EmailService class
│   ├── maintenance/               # Maintenance mode utilities
│   │   └── server.ts              # Maintenance mode server functions
│   ├── supabase/                  # Supabase clients
│   ├── prisma.ts                  # Prisma client
│   └── env.ts                     # Environment validation
├── server/                        # Server-side code
│   └── api/                       # tRPC routers
│       ├── trpc.ts                # tRPC setup
│       └── routers/               # tRPC routers
│           ├── _app.ts            # Router aggregation
│           ├── user.ts            # User operations
│           ├── workspace.ts       # Workspace operations
│           ├── analytics.ts       # Analytics data
│           ├── admin.ts           # Admin operations
│           ├── theme.ts           # Theme management
│           └── maintenance.ts     # Maintenance mode
├── prisma/                        # Prisma schema
│   └── schema.prisma              # Database schema
├── emails/                        # React Email templates
│   ├── components/                # Email components
│   │   ├── email-layout.tsx       # Base email layout
│   │   ├── email-header.tsx       # Email header
│   │   └── email-footer.tsx       # Email footer
│   ├── welcome.tsx                # Welcome email
│   ├── verification.tsx           # Email verification
│   ├── password-reset.tsx         # Password reset
│   ├── magic-link.tsx             # Magic link login
│   ├── invitation.tsx             # Team invitation
│   └── two-factor.tsx             # 2FA code email
├── hooks/                         # Custom React hooks
│   ├── use-auth.ts                # Combined session + user auth hook
│   ├── use-session.ts             # Session-only hook (prefer use-auth)
│   ├── use-notifications.ts       # Fetch unread notifications
│   ├── use-realtime-notifications.ts  # Polling with toast alerts
│   ├── use-realtime.ts            # Supabase Realtime hook (production-ready)
│   └── use-presence.ts            # User presence tracking (Supabase-ready)
└── middleware.ts                  # Next.js middleware
```

## Database Setup

### Prisma

The project uses Prisma as the ORM. The schema includes:

- Users (integrated with Better Auth)
- Organizations/Workspaces (with archiving support)
- OrganizationMembers (many-to-many with roles)
- Roles & Permissions (RBAC)
- Sessions (device tracking)
- Invitations (email and link types with usage limits)
- Notifications
- AuditLogs
- TwoFactorAuth
- Passkeys
- APIKeys (secure key management with SHA-256 hashing)
- SystemSettings (theme and maintenance mode configuration)

### Commands

```bash
# Generate Prisma client
pnpm db:generate

# Create a new migration
pnpm db:migrate

# Push schema changes (development only)
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

## Authentication

Better Auth is configured with multiple authentication methods. See `lib/auth/config.ts` for configuration.

### Supported Methods

- Email/password
- OAuth (Google, GitHub, Microsoft)
- Magic links
- Passkeys (WebAuthn)
- OTP
- 2FA (TOTP)
- Enterprise SSO (SAML, OKTA)

## RBAC System

The RBAC system supports 6-30+ permission levels. Permissions are defined in `lib/rbac/permissions.ts`.

### Default Roles

- **Owner**: All permissions (`*`)
- **Admin**: Workspace and member management
- **Member**: Read and create resources
- **Viewer**: Read-only access

### Using Permissions

```tsx
import { PermissionGuard } from '@/components/rbac/permission-guard'

<PermissionGuard permission="workspace:update">
  <Button>Update Workspace</Button>
</PermissionGuard>
```

## Workspace Management

The template includes a complete workspace management system with:

- Multi-tenant data isolation
- Workspace switching
- Member invitations
- Role assignment

## Email Templates

Email templates are built with React Email and Resend. All templates use a consistent layout with header and footer components.

### Available Templates

Templates are located in `emails/`:

- `welcome.tsx` - Welcome email for new users
- `verification.tsx` - Email verification with code
- `password-reset.tsx` - Password reset link
- `magic-link.tsx` - Magic link authentication
- `invitation.tsx` - Workspace/team invitation
- `two-factor.tsx` - 2FA authentication code

### Better Auth Integration

Emails are automatically sent for all authentication flows via Better Auth hooks in `lib/auth/config.ts`:
- Email verification on signup
- Password reset emails
- Magic link emails
- OTP emails
- 2FA code emails
- Welcome emails after successful signup

### EmailService

Centralized email sending service in `lib/email/service.ts`:

```typescript
import { EmailService } from '@/lib/email/service'

// Send welcome email
await EmailService.sendWelcome(email, name)

// Send verification email
await EmailService.sendVerification(email, verificationUrl, code)

// Send password reset
await EmailService.sendPasswordReset(email, name, resetUrl)

// Send magic link
await EmailService.sendMagicLink(email, magicLink)

// Send team invitation
await EmailService.sendInvitation(email, inviterName, organizationName, role, invitationUrl)

// Send 2FA code
await EmailService.send2FACode(email, name, code)
```

### Email Preview (Development)

Preview email templates during development:

```
http://localhost:3000/api/email/preview?template=welcome
http://localhost:3000/api/email/preview?template=verification
http://localhost:3000/api/email/preview?template=password-reset
http://localhost:3000/api/email/preview?template=magic-link
http://localhost:3000/api/email/preview?template=invitation
http://localhost:3000/api/email/preview?template=two-factor
```

**Note:** Email preview route is only available in development mode.

## Rate Limiting

Built-in rate limiting system with three tiers:

```typescript
import { checkRateLimit, strictRateLimiter, authRateLimiter } from '@/lib/rate-limit'

// Default rate limiter (100 requests per 15 minutes)
await checkRateLimit()

// Strict rate limiter (10 requests per 15 minutes)
await checkRateLimit(strictRateLimiter)

// Auth rate limiter (5 attempts per 15 minutes)
await checkRateLimit(authRateLimiter)

// Custom identifier (e.g., user ID)
await checkRateLimit(undefined, userId)
```

The rate limiting system:
- Uses in-memory storage (Redis-ready for production)
- IP-based tracking by default
- Automatic cleanup of expired entries
- Rate limit headers in responses

## Security Features

### Security Headers

Comprehensive security headers applied via `proxy.ts` and `next.config.mjs`:
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy for images
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing prevention
- **X-XSS-Protection**: XSS attack protection
- **Referrer-Policy**: Referrer information control
- **Permissions-Policy**: Feature policy restrictions

### Error Handling

Multi-level error boundaries for resilient error handling:
- Global error boundary (`app/global-error.tsx`)
- Root error boundary (`app/error.tsx`)
- Dashboard error boundary (`app/(dashboard)/error.tsx`)
- Admin error boundary (`app/(admin)/admin/error.tsx`)

Features:
- User-friendly error messages
- Development mode shows detailed errors
- Recovery actions (try again, go home)
- Automatic error logging

### Loading States

Comprehensive loading states with React Suspense:
- Dashboard loading skeletons (`app/(dashboard)/loading.tsx`)
- Settings loading skeletons (`app/(dashboard)/settings/loading.tsx`)
- Admin loading skeletons (`app/(admin)/admin/loading.tsx`)
- Suspense boundaries for streaming SSR
- Progressive content loading

## User Impersonation

Admins can impersonate users for support purposes:

### How to Use
1. Navigate to Admin → Users (`/admin/users`)
2. Click the actions menu (⋮) on any user
3. Select "Impersonate User"
4. Confirm the action
5. You'll be redirected to the dashboard as that user
6. Click "Exit Impersonation" in the banner when done

### Features
- 1-hour session expiry for security
- Complete audit logging of all impersonation actions
- Visual banner shows when impersonating
- Automatic session cleanup
- Admin-only access

### Implementation
```typescript
import { startImpersonation, stopImpersonation } from '@/lib/auth/impersonation'

// Start impersonating
await startImpersonation(adminId, userId)

// Stop impersonating
await stopImpersonation()
```

All impersonation actions are logged to the audit log with:
- Admin user ID
- Target user ID and email
- Start/end timestamps
- Session duration

## tRPC Usage

### Client-side

```tsx
'use client'

import { trpc } from '@/lib/trpc/client'

export function MyComponent() {
  const { data } = trpc.user.getCurrent.useQuery()
  
  return <div>{data?.name}</div>
}
```

### Server-side

```tsx
import { createServerCaller } from '@/lib/trpc/server'

export default async function Page() {
  const caller = await createServerCaller()
  const user = await caller.user.getCurrent()
  
  return <div>{user?.name}</div>
}
```

## File Upload System

Comprehensive file upload system with reusable components:

### ImageUpload Component

Reusable image upload with preview and removal:

```tsx
import { ImageUpload } from '@/components/upload/image-upload'

<ImageUpload
  bucket="avatars"
  path={`${userId}/avatar`}
  value={currentImageUrl}
  onChange={(url) => handleImageChange(url)}
/>
```

**Features:**
- Image preview with Next.js Image component
- Remove button with confirmation
- Automatic validation (max 5MB)
- Supports: PNG, JPG, JPEG, GIF, WEBP
- Used in:
  - Profile settings (avatar upload)
  - Workspace settings (logo upload)

### FileUpload Component

Generic file upload with drag-and-drop:

```tsx
import { FileUpload } from '@/components/upload/file-upload'

<FileUpload
  bucket="documents"
  path="uploads/"
  onUploadComplete={(url) => console.log(url)}
  maxSize={10 * 1024 * 1024}  // 10MB
  accept={{ 'image/*': ['.png', '.jpg'], 'application/pdf': ['.pdf'] }}
/>
```

**Features:**
- Drag and drop support
- Upload progress bar
- File size and type validation
- Integrates with tRPC storage endpoints

**Supabase Configuration (Optional):**
To enable Supabase Storage, add environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## In-app Notifications System

The template includes a complete notifications system with multiple hooks for different use cases:

### Notifications Bell (Implemented)

Real-time notifications dropdown in the page header:

```tsx
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown'

// Already integrated in PageHeader
<NotificationsDropdown />
```

**Features:**
- Bell icon with unread count badge (shows "9+" for 10+)
- Dropdown with scrollable notification list
- Mark individual notifications as read
- Mark all as read button
- Delete individual notifications
- Time-relative timestamps (e.g., "2 hours ago")
- Automatic refresh on interactions

### Available Hooks

#### 1. useNotifications
Fetches unread notifications for display:

```tsx
import { useNotifications } from '@/hooks/use-notifications'

export function Component() {
  const { notifications, isLoading, unreadCount } = useNotifications()

  return <Badge>{unreadCount}</Badge>
}
```

#### 2. useRealtimeNotifications
Polling with automatic toast alerts (currently active):

```tsx
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

export function Component() {
  const { notifications, unreadCount, refresh } = useRealtimeNotifications()
  // Toast notifications appear automatically for new items
}
```

**Current Implementation:** Polls every 30 seconds and shows toast for new notifications.
**Ready for Upgrade:** Can be replaced with `useRealtime` for true real-time updates.

#### 3. useRealtime (Production-Ready)
Generic Supabase Realtime subscription hook:

```tsx
import { useRealtime } from '@/hooks/use-realtime'

// Listen for new notifications
const { isConnected } = useRealtime<Notification>(
  'notifications',
  'new-notification',
  (notification) => {
    toast.success(notification.title)
    utils.notifications.list.invalidate()
  }
)

// User presence tracking
const { isConnected } = useRealtime<PresenceState>(
  `workspace:${workspaceId}`,
  'presence',
  (state) => setOnlineUsers(state.users)
)

// Live collaboration
const { isConnected } = useRealtime<DocumentUpdate>(
  `document:${docId}`,
  'content-change',
  (update) => applyRemoteUpdate(update)
)
```

**Prerequisites:**
1. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Enable Realtime in Supabase dashboard

**Common Use Cases:**
- Real-time notifications (upgrade from polling)
- User presence tracking
- Collaborative editing
- Live chat
- Activity feeds

#### 4. useSessionData
Lightweight session-only hook:

```tsx
import { useSessionData } from '@/hooks/use-session'

const { session, isLoading } = useSessionData()
```

**Note:** Prefer `useAuth()` for most cases (provides both session + user data).

#### 5. usePresence
User presence tracking (ready for Supabase):

```tsx
import { usePresence } from '@/hooks/use-presence'

export function OnlineUsers() {
  const { onlineUsers, onlineCount } = usePresence(workspaceId)
  return <div>{onlineCount} users online</div>
}
```

Structure ready for Supabase Realtime Presence integration.

## Analytics Dashboard

The dashboard includes comprehensive analytics powered by Recharts:

### Features

- **System Statistics**: Total users, organizations, members, recent activity
- **User Growth Charts**: Visualize user growth over time (7-90 day ranges)
- **Activity Metrics**: Track workspace and member activity
- **Activity Feed**: Real-time activity stream with user actions

### Usage

```tsx
import { createServerCaller } from '@/lib/trpc/server'

export default async function DashboardPage() {
  const caller = await createServerCaller()

  // Fetch analytics data
  const stats = await caller.analytics.getStats()
  const userGrowth = await caller.analytics.getUserGrowth({ days: 30 })
  const activities = await caller.analytics.getRecentActivities({ limit: 10 })

  return (
    <>
      <StatsCard title="Workspaces" value={stats.organizations} />
      <UserGrowthChart data={userGrowth} />
      <ActivityFeed activities={activities} />
    </>
  )
}
```

## Admin Dashboard

Environment-based admin access control with comprehensive management features.

### Setup

Add admin email addresses to your `.env.local`:

```env
ADMIN_EMAILS="admin@example.com,manager@example.com"
```

Only users with emails in `ADMIN_EMAILS` can access the admin dashboard at `/admin`.

### Features

**User Management** (`/admin/users`):
- Search users by email or name
- Ban/unban users
- Delete user accounts
- Impersonate users for support (with audit logging)
- View user organizations and roles
- Pagination support (50 users per page)

**System Statistics** (`/admin`):
- Total users, organizations, members
- Recent signups (last 30 days)
- Active users (last 7 days)
- Growth metrics

**Audit Logs** (`/admin/audit`):
- Complete audit trail of user actions
- Filter by action type (login, signup, workspace operations, etc.)
- CSV export functionality
- User information with avatars
- IP address tracking
- Timestamp with relative time display

**Maintenance Mode** (`/admin/maintenance`):
- Enable/disable site-wide maintenance banners
- Customize maintenance messages
- Set optional scheduled end times with countdown
- Visual status indicators (active/inactive)
- Audit logging for all maintenance actions
- Banner displayed across all pages (dashboard and admin)

### Admin Access Control

The admin system uses `requireAdmin()` middleware in `lib/auth/admin-helpers.ts`:

```typescript
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function AdminLayout({ children }) {
  await requireAdmin() // Redirects non-admins to homepage

  return <>{children}</>
}
```

### tRPC Admin Router

Admin operations are exposed through the `admin` tRPC router:

```typescript
// Get all users with search
trpc.admin.getAllUsers.useQuery({ limit: 50, offset: 0, search: 'john' })

// Get system statistics
trpc.admin.getSystemStats.useQuery()

// Get audit logs
trpc.admin.getAuditLogs.useQuery({
  action: 'user.login',
  limit: 50,
  offset: 0
})

// Delete user
trpc.admin.deleteUser.useMutation()

// Update user status (ban/unban)
trpc.admin.updateUserStatus.useMutation()
```

## Settings Pages

Five comprehensive settings pages for user management:

### Profile Settings (`/settings/profile`)

- Avatar upload with preview (max 5MB)
- Name and bio editing
- Timezone selection (50+ timezones)
- Language selection (10+ languages)
- Real-time form validation with Zod

### Account Settings (`/settings/account`)

- Email address change with verification
- Password change with strength validation
- Delete account with confirmation (requires typing "DELETE")
- Account status display

### Security Settings (`/settings/security`)

- Two-factor authentication (2FA) setup
- Active sessions management
- Passkeys (WebAuthn) management
- Security audit log

### Team Management (`/settings/team`)

- Current workspace members table
- Role assignment (Owner, Admin, Member, Viewer)
- Invite new members via email
- Remove members from workspace
- Pending invitations list with resend/cancel options
- RBAC integration

### Notification Preferences (`/settings/notifications`)

- 7 notification categories:
  - Team invitations
  - Security alerts
  - Product updates
  - Activity notifications
  - Workspace updates
  - Billing updates
  - Marketing emails
- Toggle email/in-app notifications per category
- Save/cancel with change detection

## Internationalization

The template includes next-intl for i18n support. Translation files are in `messages/`.

## Scripts

```bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm start       # Start production server
pnpm lint        # Run Oxlint
pnpm lint:fix    # Run Oxlint with auto-fix
pnpm format      # Format code with Biome
pnpm db:generate # Generate Prisma client
pnpm db:migrate  # Run database migrations
pnpm db:studio   # Open Prisma Studio
```

## Code Quality

This template uses:

- **Biome** - Formatting, import sorting, unused import removal
- **Oxlint** - Fast Rust-based linter
- **Husky** - Git hooks for pre-commit formatting and linting

## Deployment

This template is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables
4. Deploy

### Database Migrations

Run migrations before deployment:

```bash
pnpm db:migrate
```

### Known Issues

**Next.js 16 Build Issue**: The production build currently has a Turbopack error. This is a known issue with Next.js 16.0.3. See `BUILD_NOTES.md` for details and solutions:
- Use Next.js 15 for production: `pnpm add next@15`
- Wait for Next.js 16.1+ with Turbopack fixes
- Development server works perfectly

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

## License

MIT

---

Built with Next.js 16, Prisma, Better Auth, Supabase, and tRPC
