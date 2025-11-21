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
- **Workspace Management** with multi-tenant architecture
- **Admin Dashboard**:
  - User management (search, ban/unban, delete)
  - System statistics and metrics
  - Audit logs with filtering and CSV export
  - Environment-based admin access control
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
  - Resend integration
  - React Email templates (6 templates: welcome, verification, password-reset, magic-link, invitation, 2FA)
  - EmailService class for centralized email sending
  - Email preview route for development
  - Marketing email support (Mailchimp, Loops, ConvertKit)
- **In-app Notifications** with realtime updates (polling + Supabase-ready)
- **Internationalization (i18n)** with next-intl
- **ShadCN UI** component library (50+ components)
- **Tailwind CSS 4** for styling
- **Code Quality** with Biome and Oxlint

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
│   │       └── audit/             # Audit logs
│   ├── api/                       # API routes
│   │   ├── auth/[...all]/         # Better Auth routes
│   │   ├── trpc/[trpc]/           # tRPC routes
│   │   └── email/preview/         # Email template preview (dev only)
│   └── layout.tsx                 # Root layout
├── components/                     # React components
│   ├── admin/                     # Admin components
│   │   ├── users-table.tsx        # User management table
│   │   └── audit-log-table.tsx    # Audit log table
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
│           └── admin.ts           # Admin operations
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
│   ├── use-realtime-notifications.ts  # Realtime notifications
│   └── use-presence.ts            # User presence tracking
└── middleware.ts                  # Next.js middleware
```

## Database Setup

### Prisma

The project uses Prisma as the ORM. The schema includes:

- Users (integrated with Better Auth)
- Organizations/Workspaces
- OrganizationMembers (many-to-many with roles)
- Roles & Permissions (RBAC)
- Sessions (device tracking)
- Invitations
- Notifications
- AuditLogs
- TwoFactorAuth
- Passkeys

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

## Supabase Storage

File uploads are handled through Supabase Storage. **Note:** Supabase configuration is required for this feature.

```tsx
import { FileUpload } from '@/components/upload/file-upload'

<FileUpload
  bucket="avatars"
  onUploadComplete={(url) => console.log(url)}
/>
```

To enable Supabase Storage, add the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Realtime Features

Supabase Realtime is integrated for live updates. **Note:** Supabase configuration is required for this feature.

The template includes two realtime hooks:

### Realtime Notifications

```tsx
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

export function NotificationBell() {
  const { notifications, unreadCount, refresh } = useRealtimeNotifications()

  return (
    <Badge>{unreadCount}</Badge>
  )
}
```

Currently uses polling (30-second intervals) with structure ready for Supabase Realtime upgrade.

### User Presence

```tsx
import { usePresence } from '@/hooks/use-presence'

export function OnlineUsers() {
  const { onlineUsers, onlineCount } = usePresence(workspaceId)

  return <div>{onlineCount} users online</div>
}
```

Structure ready for Supabase Realtime Presence integration.

To enable Supabase Realtime, add the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
