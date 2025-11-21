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
- Secondary nav: Support, Feedback
- Uses constants from `lib/constants.ts`: `NAME`, `EMAIL_URL`, `IMAGE_URL`

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
- `user` - User operations (getCurrent, update)
- `workspace` - Workspace/organization management
- `permissions` - RBAC permission checks
- `invitations` - Team invitations
- `notifications` - Notification management
- `storage` - File upload/download
- `analytics` - Dashboard analytics (getStats, getUserGrowth, getActivityMetrics, getRecentActivities)
- `admin` - Admin operations (getAllUsers, getSystemStats, getAuditLogs, deleteUser, updateUserStatus)

### Admin Dashboard Pattern

**Route Group Structure**: `app/(admin)/admin/`
- Protected by `requireAdmin()` in layout
- Three main pages: dashboard (`/admin`), users (`/admin/users`), audit logs (`/admin/audit`)
- Admin warning banner in layout

**Admin Components** (`components/admin/`):
- `users-table.tsx` - User management with search, ban/unban, delete
- `audit-log-table.tsx` - Audit trail with filtering and CSV export

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
- Avatar upload with preview and size validation (max 5MB)
- Password strength validation with regex
- Confirmation dialogs for destructive actions (e.g., delete account requires typing "DELETE")
- Role-based access control for team management

### Email System Pattern

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

### Realtime Notifications Pattern

**Polling Approach** (`hooks/use-realtime-notifications.ts`):
- Uses `refetchInterval: 30000` (30 seconds) in tRPC query
- Shows toast notifications for new items
- Tracks `lastCheck` timestamp to filter new notifications
- Structure ready for Supabase Realtime upgrade

**Presence Tracking** (`hooks/use-presence.ts`):
- Placeholder structure for online user tracking
- TODO comments for Supabase Realtime Presence integration
- Returns `onlineUsers` and `onlineCount`

### Customization Entry Points

1. **Branding**: `lib/constants.ts` - Update company name, URLs, contact info
2. **SEO Metadata**: `app/layout.tsx` - Site title, description, OpenGraph, Twitter cards
3. **Theme Colors**: `app/globals.css` - CSS variables for theming
4. **Navigation**: `components/app-sidebar.tsx` - Sidebar menu structure

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

## Database & Prisma Patterns

**Schema Structure** (`prisma/schema.prisma`):
- Users (integrated with Better Auth)
- Organizations/Workspaces with multi-tenant support
- OrganizationMembers (many-to-many with roles)
- Roles & Permissions (RBAC)
- Sessions with device tracking
- Invitations for team members
- Notifications (in-app)
- AuditLogs for activity tracking
- TwoFactorAuth, Passkeys

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
