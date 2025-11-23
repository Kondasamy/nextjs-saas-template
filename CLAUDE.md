# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev         # Start development server at http://localhost:3000
pnpm build       # Build for production (TypeScript errors ignored in build)
pnpm start       # Start production server

# Database
pnpm db:generate # Generate Prisma client
pnpm db:migrate  # Run database migrations
pnpm db:push     # Push schema changes (development only)
pnpm db:studio   # Open Prisma Studio

# Code Quality
pnpm lint        # Run Oxlint to check for linting issues
pnpm lint:fix    # Run Oxlint with auto-fix
pnpm format      # Format code, sort imports, and remove unused imports with Biome
pnpm pre-commit  # Run formatting and linting (used by Husky pre-commit hook)
```

**Package Manager**: This project uses `pnpm`. Do not use `npm` or `yarn`.

## Code Quality Tools

The project uses two modern linting/formatting tools:

- **Biome** (`biome.json`): Handles formatting, import organization, and unused import removal
  - Configured for: tab indentation (width 2), single quotes, no semicolons, ES5 trailing commas
  - Line width: 80 characters
  - Automatically organizes imports with `pnpm format`

- **Oxlint** (`.oxlintrc.json`): Fast Rust-based linter
  - Allows `@typescript-eslint/no-explicit-any`
  - Ignores build artifacts and lock files

**Git Hooks**: Husky pre-commit hook runs `pnpm format && pnpm lint:fix` automatically before each commit.

## Architecture Overview

This is an **Enterprise SaaS Template** built with **Next.js 16 App Router**, combining content-driven architecture with comprehensive SaaS features including authentication, RBAC, multi-tenancy, analytics, and admin management.

### Content Management Pattern

Content is managed through **TypeScript data files** rather than a CMS:

- **Features**: `app/features/data.ts` exports `THINGS[]` array of type `Thing`
  - Each feature has: `uid`, `title`, `description`, `link`, `url`, `cover`, `github`, etc.
  - Dynamic routes: `app/features/[slug]/page.tsx` renders individual features

- **Documentation**: `app/docs/data.ts` exports `tutorials[]` and `videoTutorials[]`
  - Types: `Tutorial` and `VideoTutorial` with social links support
  - Combined export: `TUTORIALS = [...tutorials, ...videoTutorials]`

- **Blog**: `app/blog/data.ts` for blog posts
  - Supports both data file entries and MDX files at `app/blog/[slug]/page.mdx`

**Important**: When adding new content, update the respective data files. The slug in URLs should match the `link` property in the data objects.

### Layout Architecture

**Root Layout** (`app/layout.tsx`):
- Wraps entire app with `SidebarProvider` → `AppSidebar` → `SidebarInset` structure
- `ThemeProvider` from next-themes enables dark/light mode (default: dark)
- Global components: `PageHeader` and `Toaster` (Sonner)
- Fonts: Geist and Geist Mono via next/font

**Sidebar Navigation** (`components/app-sidebar.tsx`):
- Client component using `usePathname()` for active state
- Navigation data defined inline (not from data files)
- Main nav: Dashboard, Features, Documentation, Settings (5 sub-pages), Admin (3 sub-pages)
- Secondary nav: Support, Feedback (opens dialogs)
- Uses constants from `lib/constants.ts`: `NAME`, `EMAIL_URL`
- Footer: NavUser component with user dropdown

**PageHeader** (`components/page-header.tsx`):
- Left side: SidebarTrigger, Breadcrumbs with page icons
- Right side: NotificationsDropdown, Theme toggle, UserAvatarMenu
- Client component with theme toggle animation
- Dynamic page title based on pathname

### Authentication & Authorization

**Better Auth** (`lib/auth/config.ts`):
- Supports 7 authentication methods: email/password, OAuth (Google, GitHub, Microsoft), magic links, passkeys, OTP, 2FA, SSO
- Session management with device tracking
- Auth helpers in `lib/auth/auth-helpers.ts`: `requireAuth()`, `getAuthSession()`
- Admin access control in `lib/auth/admin-helpers.ts`: `requireAdmin()`, `isUserAdmin()`

**Admin Access Control**:
- Environment-based: `ADMIN_EMAILS="admin@example.com,manager@example.com"`
- `requireAdmin()` redirects non-admins to homepage
- Logs helpful debug info in development mode
- Used in admin layout: `app/(admin)/admin/layout.tsx`

### tRPC Architecture

**Server-Side Patterns**:
```typescript
// Server Components - Use createServerCaller()
import { createServerCaller } from '@/lib/trpc/server'

export default async function Page() {
  const caller = await createServerCaller()
  const data = await caller.analytics.getStats()
  return <Component data={data} />
}
```

**Client-Side Patterns**:
```typescript
// Client Components - Use trpc from client
'use client'
import { trpc } from '@/lib/trpc/client'

export function Component() {
  const { data } = trpc.analytics.getStats.useQuery()
  const mutation = trpc.user.update.useMutation()
  return <div>{data?.value}</div>
}
```

**Available Routers**:
- `user` - User operations (getCurrent, update, updateProfile, exportAccountData, getUserActivityLog)
- `workspace` - Workspace/organization management (cloneWorkspace, archiveWorkspace, unarchiveWorkspace, getWorkspaceUsage, bulkUpdateMemberRoles, bulkRemoveMembers, update)
- `permissions` - RBAC permission checks (listRoles, createRole, updateRole, deleteRole)
- `invitations` - Team invitations (createInviteLink, listInviteLinks, revokeInviteLink, acceptInviteLink, bulkInviteMembers)
- `notifications` - Notification management (list, markAsRead, markAllAsRead, delete)
- `storage` - File upload/download (getUploadUrl, getPublicUrl)
- `analytics` - Dashboard analytics (getStats, getUserGrowth, getActivityMetrics, getRecentActivities)
- `admin` - Admin operations (getAllUsers, getSystemStats, getAuditLogs, deleteUser, updateUserStatus)
- `theme` - Theme management (getAvailableThemes, getActiveTheme, setActiveTheme)
- `maintenance` - Maintenance mode (getStatus, enable, disable)
- `apiKeys` - API key management (list, create, revoke, validate)
- `feedback` - User feedback and support (submitFeedback, submitSupport)

### Admin Dashboard Pattern

**Route Group Structure**: `app/(admin)/admin/`
- Protected by `requireAdmin()` in layout
- Main pages: dashboard (`/admin`), users (`/admin/users`), audit logs (`/admin/audit`), themes (`/admin/themes`), maintenance (`/admin/maintenance`), emails (`/admin/emails`)
- Admin warning banner in layout

**Admin Features**:
- User impersonation system with audit logging
- Impersonation banner component (`components/admin/impersonation-banner.tsx`)
- Impersonation API routes (`app/api/admin/impersonation/`)
- 1-hour session expiry for security
- Maintenance mode banner system (site-wide notifications with scheduled end times)
- Theme management (switch between available themes)

**Admin Components** (`components/admin/`):
- `users-table.tsx` - User management with search, ban/unban, delete
- `audit-log-table.tsx` - Audit trail with filtering and CSV export
- `impersonation-banner.tsx` - Impersonation warning banner
- `theme-manager.tsx` - Theme selection and management
- `maintenance-manager.tsx` - Maintenance mode controls with status, message, and end time

**Maintenance Banner Components**:
- `components/maintenance-banner.tsx` - Client component displaying maintenance warning
- `components/maintenance-banner-wrapper.tsx` - Server component that fetches status and conditionally renders banner
- Integrated into dashboard and admin layouts
- Displays site-wide when maintenance mode is enabled

**Admin tRPC Router** (`server/api/routers/admin.ts`):
- All procedures require authentication (uses `protectedProcedure`)
- TODO comments indicate where admin checks should be added
- Supports pagination with limit/offset
- Search functionality for users

### Analytics Dashboard Pattern

**Dashboard Page** (`app/(dashboard)/page.tsx`):
- Server Component fetching data in parallel with `Promise.all`
- Uses `createServerCaller()` for data fetching
- Combines multiple data sources: stats, user growth, activities

**Analytics Components** (`components/analytics/`):
- `stats-card.tsx` - Reusable stat display with icon
- `user-growth-chart.tsx` - Recharts area chart with responsive container
- `activity-feed.tsx` - Real-time activity stream with avatars

**Analytics Router** (`server/api/routers/analytics.ts`):
- `getStats()` - Organizations, members, notifications, recent activity counts
- `getUserGrowth({ days })` - Time-series data for charts (7-90 days)
- `getActivityMetrics()` - Workspace and member activity counts
- `getRecentActivities({ limit })` - Activity feed data with user info

### Settings Pages Pattern

**Settings Structure**: `app/(dashboard)/settings/[page]/page.tsx`
- 5 pages: profile, account, security, team, notifications
- Each page has dedicated components in `components/settings/`
- Uses tRPC mutations for updates with optimistic updates and toast notifications

**Settings Components**:
- Form validation with React Hook Form + Zod schemas
- Avatar upload using `ImageUpload` component (reusable, max 5MB)
- Password strength validation with regex
- Confirmation dialogs for destructive actions (e.g., delete account requires typing "DELETE")
- Role-based access control for team management

**Upload Components** (`components/upload/`):
- `ImageUpload` - Reusable image upload with preview and removal
  - Used in: ProfileSettingsForm (avatar), WorkspaceLogoUpload (logo)
  - Props: `bucket`, `path`, `value`, `onChange`
  - Features: preview, remove button, 5MB validation, supports PNG/JPG/GIF/WEBP
- `FileUpload` - Generic file upload with drag-and-drop
  - Features: progress bar, validation, tRPC integration
  - Props: `bucket`, `path`, `onUploadComplete`, `maxSize`, `accept`

**User Components** (`components/user/`):
- `UserAvatarMenu` - User dropdown menu in PageHeader
  - Shows avatar, name, email
  - Links to Profile and Settings
  - Sign out functionality
  - Uses `useAuth()` hook for user data

### Email System Pattern (✅ Fully Integrated)

**Better Auth Integration** (`lib/auth/config.ts`):
- All email templates are connected to Better Auth hooks
- Emails automatically sent for: verification, password reset, magic links, OTP, 2FA
- Welcome emails sent automatically after signup
- Graceful fallback: logs to console if RESEND_API_KEY not set

**Email Templates** (`emails/`):
- Base layout in `components/email-layout.tsx` with header and footer
- 6 templates: welcome, verification, password-reset, magic-link, invitation, two-factor
- All use React Email components with Tailwind styling

**EmailService** (`lib/email/service.ts`):
- Centralized service class with static methods
- Each method renders template and sends via Resend
- Consistent error handling
```typescript
await EmailService.sendWelcome(email, name)
await EmailService.sendVerification(email, verificationUrl, code)
await EmailService.send2FACode(email, name, code)
```

**Email Preview Route** (`app/api/email/preview/route.ts`):
- Development-only route (returns 404 in production)
- Access via `/api/email/preview?template=welcome`
- Useful for testing email templates

### Notifications System (✅ Fully Implemented)

**NotificationsDropdown** (`components/notifications/notifications-dropdown.tsx`):
- Bell icon in PageHeader with unread count badge
- Dropdown with scrollable notification list (400px max height)
- Mark as read/delete individual notifications
- Mark all as read functionality
- Time-relative timestamps with date-fns
- Integrated with `useNotifications` hook

**Available Hooks**:

1. **useNotifications** (`hooks/use-notifications.ts`):
   - Fetches unread notifications from tRPC
   - Returns: `notifications`, `isLoading`, `unreadCount`
   - Used in NotificationsDropdown component

2. **useRealtimeNotifications** (`hooks/use-realtime-notifications.ts`):
   - Polls every 30 seconds with `refetchInterval`
   - Shows toast notifications for new items
   - Tracks `lastCheck` timestamp to filter new notifications
   - Ready for Supabase Realtime upgrade

3. **useRealtime** (`hooks/use-realtime.ts`):
   - Generic Supabase Realtime subscription hook
   - Production-ready with comprehensive documentation
   - Use cases: notifications, presence, collaboration, chat
   - Requires Supabase environment variables

4. **useSessionData** (`hooks/use-session.ts`):
   - Lightweight session-only hook
   - Documented to prefer `useAuth()` for most cases
   - Returns: `session`, `isLoading`

5. **usePresence** (`hooks/use-presence.ts`):
   - Placeholder structure for online user tracking
   - Ready for Supabase Realtime Presence integration
   - Returns: `onlineUsers`, `onlineCount`

**Notifications Router** (`server/api/routers/notifications.ts`):
- `list` - Fetch notifications with `unreadOnly` and `read` filters
- Returns `unreadCount` for badge display
- `markAsRead` - Mark individual notification as read
- `markAllAsRead` - Mark all user notifications as read
- `delete` - Delete individual notification

**PageHeader Integration**:
- NotificationsDropdown positioned between sidebar and theme toggle
- Bell icon with red badge for unread count
- Shows "9+" for 10+ unread notifications
- Dropdown aligned to right edge

### Production Ready Features (✅ Implemented)

**Error Boundaries**:
- Global error boundary (`app/global-error.tsx`)
- Root error boundary (`app/error.tsx`)
- Dashboard error boundary (`app/(dashboard)/error.tsx`)
- Admin error boundary (`app/(admin)/admin/error.tsx`)
- User-friendly messages with recovery actions
- Development mode shows detailed errors

**Loading States**:
- Dashboard loading skeletons (`app/(dashboard)/loading.tsx`)
- Settings loading skeletons (`app/(dashboard)/settings/loading.tsx`)
- Admin loading skeletons (`app/(admin)/admin/loading.tsx`)
- React Suspense boundaries for streaming SSR
- Inline skeleton components in dashboard page

**Rate Limiting** (`lib/rate-limit.ts`):
- In-memory rate limiting (Redis-ready)
- Three tiers: default (100 req/15min), strict (10 req/15min), auth (5 req/15min)
- IP-based tracking with automatic cleanup
- Rate limit headers in responses

**Security Headers** (`proxy.ts` and `next.config.mjs`):
- HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Applied to all responses via proxy function

**User Impersonation** (`lib/auth/impersonation.ts`):
- Complete impersonation system with cookie-based sessions
- Audit logging of all impersonation actions
- Impersonation banner component
- API routes for start/stop impersonation
- Admin panel integration in users table

### Theme Management System

**Admin-Controlled Themes**:
- Themes are stored as CSS files in the `themes/` directory
- Active theme is stored in the database (`SystemSettings` model)
- Admins can switch themes via `/admin/themes` page
- Theme CSS is dynamically loaded on every page load

**Available Themes**:
- `default` - Neutral slate palette (original)
- `bubblegum` - Playful pink and purple
- `ocean` - Calm blue and teal
- `forest` - Natural green and earth tones

**Adding Custom Themes**:
1. Create a new CSS file in `themes/your-theme.css` with OKLCH color variables
2. Add theme definition to `lib/theme/config.ts` in `AVAILABLE_THEMES` array
3. Restart the application
4. Theme will appear in admin panel

**Using TweakCN to Create Themes**:
1. Visit https://tweakcn.com/editor/theme
2. Customize colors using the visual editor
3. Export as CSS (choose OKLCH format)
4. Save to `themes/your-theme.css`
5. Add definition to `lib/theme/config.ts`

**Theme Architecture**:
- `themes/` - Theme CSS files
- `lib/theme/config.ts` - Theme definitions and metadata
- `lib/theme/server.ts` - Server-side theme utilities
- `server/api/routers/theme.ts` - tRPC router for theme operations
- `components/theme-styles.tsx` - Server component that injects theme CSS
- `components/admin/theme-manager.tsx` - Admin UI for theme management
- `app/api/theme/route.ts` - API endpoint to serve active theme CSS

### Customization Entry Points

1. **Branding**: `lib/constants.ts` - Update company name, URLs, contact info
2. **SEO Metadata**: `app/layout.tsx` - Site title, description, OpenGraph, Twitter cards
3. **Theme Management**: `/admin/themes` - Admin panel to switch themes (TweakCN-style)
4. **Custom Themes**: `themes/` directory - Add new theme CSS files
5. **Navigation**: `components/app-sidebar.tsx` - Sidebar menu structure

### TypeScript Configuration

- Path alias: `@/*` maps to root directory
- `typescript.ignoreBuildErrors: true` in `next.config.mjs` (allows builds with type errors)
- Strict mode enabled in `tsconfig.json`

### MDX Support

- Configured via `@next/mdx` in `next.config.mjs`
- `mdx-components.tsx` defines custom MDX components
- Page extensions: `['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']`

### Motion Primitives

10 custom animation components in `components/motion-primitives/`:
- animated-background, magnetic, morphing-dialog, progressive-blur, scroll-progress
- spotlight, text-effect, text-loop, text-morph, tilt

These are reusable motion components built with Framer Motion for enhanced UI interactions.

## Tech Stack Notes

### Core Framework
- **Next.js 16** with React 19 (App Router only, no Pages Router)
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS 4** (note: v4 uses different configuration than v3)

### Backend & Data
- **Prisma ORM** for database access (PostgreSQL)
- **tRPC** for end-to-end type safety with React Query
- **Better Auth** for authentication (7 methods supported)
- **Supabase** (optional) for storage and realtime features

### UI & Components
- **shadcn/ui**: 50+ Radix UI components in `components/ui/`
- **Motion Primitives**: 10 custom animation components
- **Recharts**: Data visualization for analytics charts
- **Icons**: Lucide React
- **Toast**: Sonner for notifications
- **Theme**: next-themes for dark/light mode

### Forms & Validation
- **React Hook Form** for form state management
- **Zod** for schema validation and type inference
- Password strength validation with regex patterns
- File upload validation (size, type)

### Email
- **React Email** for template-based emails
- **Resend** for email delivery
- 6 pre-built templates with consistent styling

### Code Quality
- **Biome**: Formatting, import sorting, unused import removal
- **Oxlint**: Fast Rust-based linter
- **Husky**: Git hooks for pre-commit checks

### Other Tools
- **date-fns**: Date formatting and manipulation
- **Shiki**: Code syntax highlighting
- **react-markdown + remark-gfm**: Markdown rendering
- **Vercel Analytics**: User analytics integration

## Advanced Workspace Features

### Workspace Templates (Cloning)

Clone workspaces with all settings, roles, and permissions:
- `/workspace/settings` - "Clone Workspace" button in Danger Zone
- `workspace.cloneWorkspace` tRPC procedure
- Copies: workspace settings (name, description, logo), all roles with permissions
- Does NOT copy: members, invitations, activity history
- Creates audit log entry with metadata

### Workspace Archiving

Archive and restore workspaces:
- `/workspace/settings` - "Archive Workspace" button in Danger Zone
- `/settings/workspaces/archived` - View and restore archived workspaces
- `workspace.archiveWorkspace` / `workspace.unarchiveWorkspace` procedures
- `workspace.listArchived` - Lists user's archived workspaces
- Archived workspaces are hidden from workspace switcher
- Requires workspace name confirmation before archiving
- Creates audit log entries for archive/unarchive actions

### Advanced Permission Management

Granular permission system with visual management:
- `/workspace/roles` - Roles & Permissions management page
- `lib/permissions/constants.ts` - Permission definitions grouped by category
- `lib/permissions/checker.ts` - Permission checking utilities
- Permission categories: Admin, Workspace, Members, Roles, Content, Settings
- `PermissionBrowser` component - Visual permission selector with categories
- `RoleEditorDialog` - Create/edit custom roles with permission selection
- Supports wildcard `*` permission for full access

### API Key Management

Secure API key generation and management:
- `/workspace/api-keys` - API Keys management page
- `apiKeys` tRPC router with procedures: list, create, revoke, validate
- Keys are SHA-256 hashed for secure storage
- Only last 8 characters stored in plaintext for identification
- Full key shown only once on creation
- Support for expiration dates (7, 30, 90, 365 days, or never)
- Usage tracking with `lastUsedAt` timestamp
- Audit logging for all key operations

### Invitation Links

Shareable workspace invitation links:
- `invitations.createInviteLink` - Generate shareable link with optional usage limits
- `invitations.listInviteLinks` - View all active invitation links
- `invitations.revokeInviteLink` - Revoke a link
- `invitations.acceptInviteLink` - Accept invitation via link
- `/invite/[token]` - Public invitation acceptance page
- Supports unlimited or limited uses (maxUses)
- Tracks usage count for link-type invitations
- Expires after configurable days

### Bulk Member Operations

Efficient bulk operations for team management:
- `invitations.bulkInviteMembers` - Invite multiple members via email list
- `workspace.bulkUpdateMemberRoles` - Update multiple member roles
- `workspace.bulkRemoveMembers` - Remove multiple members
- Uses `Promise.allSettled` for partial success handling
- Returns detailed results with successful and failed operations
- Creates audit log entries with operation summary
- Email parsing supports newlines, commas, semicolons, spaces

### User Activity History

Paginated activity log for users:
- `user.getUserActivityLog` - Retrieve user's audit log with pagination
- `/settings/account` - Activity Log section
- Displays action labels, timestamps, IP addresses
- Expandable metadata for detailed information
- Pagination controls (Previous/Next)
- Tracks workspace operations, security events, bulk actions

### Workspace Usage Metrics

Comprehensive workspace analytics:
- `workspace.getWorkspaceUsage` - Calculate workspace metrics
- `/workspace/settings` - Usage Dashboard at top of page
- Metrics: member count, active members (30d), pending invitations
- Active invite links count, recent activity count (30d)
- Activity rate percentage with progress bar
- Member engagement insights

## Database & Prisma Patterns

**Schema Structure** (`prisma/schema.prisma`):
- Users (integrated with Better Auth, includes bio, timezone, language)
- Organizations/Workspaces with multi-tenant support (includes archived, archivedAt, archivedBy)
- OrganizationMembers (many-to-many with roles)
- Roles & Permissions (RBAC)
- Sessions with device tracking
- Invitations for team members (supports email and link types with usage limits: type, maxUses, usedCount)
- Notifications (in-app)
- AuditLogs for activity tracking
- TwoFactorAuth, Passkeys
- APIKeys (secure key management with hashedKey, lastUsedAt, expiresAt)
- SystemSettings (singleton for theme and maintenance mode: maintenanceMode, maintenanceMessage, maintenanceStartedAt, maintenanceEndTime)

**Common Patterns**:
```typescript
// Always use ctx.prisma from tRPC context
const users = await ctx.prisma.user.findMany({
  where: { banned: false },
  include: {
    organizations: {
      include: { organization: true, role: true }
    }
  }
})

// Use Promise.all for parallel queries
const [users, total] = await Promise.all([
  ctx.prisma.user.findMany({ where, take: limit, skip: offset }),
  ctx.prisma.user.count({ where })
])
```

**Database Commands**:
- `pnpm db:generate` - Generate Prisma client after schema changes
- `pnpm db:migrate` - Create and run migrations (production)
- `pnpm db:push` - Push schema directly (development only)
- `pnpm db:studio` - Open Prisma Studio for data viewing

## Image Configuration

`next.config.mjs` allows remote images from:
- placehold.co (placeholder images)
- api.dicebear.com (avatar generation)
- github.com
- *.googleapis.com
- imagedelivery.net
- raw.githubusercontent.com

SVG images are allowed with CSP restrictions.

## Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (min 32 chars)
- `BETTER_AUTH_URL` - Your app URL (e.g., http://localhost:3000)
- `NEXT_PUBLIC_APP_URL` - Your application URL

**Admin Access**:
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

**Optional (Email)**:
- `RESEND_API_KEY` - Resend API key for emails
- `EMAIL_FROM_ADDRESS` - Email sender address
- `EMAIL_FROM_NAME` - Email sender name

**Optional (Supabase)**:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional (OAuth)**:
- Google, GitHub, Microsoft OAuth credentials
- SSO credentials (SAML, OKTA)

See `.env.local.example` for complete list with descriptions.

## Important Implementation Notes

### Email System
All email templates are fully integrated with Better Auth. Emails are sent automatically for:
- User signup (verification + welcome)
- Password reset requests
- Magic link authentication
- OTP codes
- 2FA codes

No additional code needed - just configure `RESEND_API_KEY` in environment variables.

### Rate Limiting
Use the rate limiting system in API routes and tRPC procedures:
```typescript
import { checkRateLimit, strictRateLimiter } from '@/lib/rate-limit'

// In API route or tRPC procedure
await checkRateLimit() // Uses default limiter
await checkRateLimit(strictRateLimiter) // Uses strict limiter
```

### User Impersonation
Admins can impersonate users from the admin panel (`/admin/users`):
- Click actions menu (⋮) on any user
- Select "Impersonate User"
- All actions are logged to audit log
- 1-hour session expiry
- Visual banner when impersonating

### Error Boundaries
Error boundaries are automatically in place:
- Catch errors at global, route group, and page levels
- Show user-friendly error messages
- Provide recovery actions
- Log errors in development mode

### Loading States
Loading states work automatically via:
- `loading.tsx` files in route groups
- React Suspense boundaries in dashboard
- Skeleton components that match actual content

## Known Issues

**Next.js 16 Build Issue**: Production builds fail with Turbopack error. This is a pre-existing issue with Next.js 16.0.3, not introduced by recent changes.
- **Solution 1**: Use Next.js 15 for production (`pnpm add next@15`)
- **Solution 2**: Wait for Next.js 16.1+ with fixes
- **Note**: Development server works perfectly
- See `BUILD_NOTES.md` for full details
