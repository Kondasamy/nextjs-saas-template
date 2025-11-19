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
- **Supabase** integration:
  - PostgreSQL database
  - Storage for file uploads
  - Realtime subscriptions
  - Edge Functions support
- **RBAC System** with 6-30+ permission levels
- **Workspace Management** with multi-tenant architecture
- **Email Infrastructure**:
  - Resend integration
  - React Email templates
  - Marketing email support (Mailchimp, Loops, ConvertKit)
- **In-app Notifications** with realtime updates
- **Internationalization (i18n)** with next-intl
- **ShadCN UI** component library (50+ components)
- **Tailwind CSS 4** for styling
- **Code Quality** with Biome and Oxlint

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- PostgreSQL database (Supabase recommended)
- Supabase account
- Resend account (for emails)

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

- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (min 32 chars)
- `BETTER_AUTH_URL` - Your app URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Resend API key for emails
- `NEXT_PUBLIC_APP_URL` - Your application URL

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
│   │   ├── dashboard/
│   │   ├── workspaces/
│   │   ├── settings/
│   │   └── notifications/
│   ├── api/                       # API routes
│   │   ├── auth/[...all]/         # Better Auth routes
│   │   └── trpc/[trpc]/           # tRPC routes
│   └── layout.tsx                 # Root layout
├── components/                     # React components
│   ├── auth/                      # Authentication components
│   ├── workspace/                 # Workspace management
│   ├── rbac/                      # RBAC components
│   ├── notifications/             # Notification components
│   ├── upload/                    # File upload components
│   ├── user/                      # User components
│   └── ui/                        # ShadCN UI components
├── lib/                           # Utility functions
│   ├── auth/                      # Better Auth configuration
│   ├── trpc/                      # tRPC client/server
│   ├── rbac/                      # RBAC utilities
│   ├── email/                     # Email utilities
│   ├── supabase/                  # Supabase clients
│   ├── prisma.ts                  # Prisma client
│   └── env.ts                     # Environment validation
├── server/                        # Server-side code
│   └── api/                       # tRPC routers
│       ├── trpc.ts                # tRPC setup
│       └── routers/                # tRPC routers
├── prisma/                        # Prisma schema
│   └── schema.prisma              # Database schema
├── emails/                        # React Email templates
├── hooks/                         # Custom React hooks
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

Email templates are built with React Email. Templates are located in `emails/`:

- `welcome.tsx` - Welcome email
- `verification.tsx` - Email verification
- `invitation.tsx` - Workspace invitation

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

File uploads are handled through Supabase Storage:

```tsx
import { FileUpload } from '@/components/upload/file-upload'

<FileUpload
  bucket="avatars"
  onUploadComplete={(url) => console.log(url)}
/>
```

## Realtime Features

Supabase Realtime is integrated for live updates:

```tsx
import { useRealtime } from '@/hooks/use-realtime'

useRealtime('notifications', 'new-notification', (payload) => {
  console.log('New notification:', payload)
})
```

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
