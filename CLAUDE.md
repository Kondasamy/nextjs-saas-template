# CLAUDE.md

Development guidance for Claude Code (claude.ai/code) when working with this repository.

## Quick Reference

**Package Manager**: Use `pnpm` (not npm or yarn)
**Node Version**: 18+ required
**Framework**: Next.js 16 App Router (no Pages Router)
**Database**: PostgreSQL with Prisma ORM

## Essential Commands

```bash
# Development
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations (production)
pnpm db:push      # Push schema (development)
pnpm db:studio    # Open Prisma Studio

# Code Quality
pnpm lint         # Check linting (Oxlint)
pnpm lint:fix     # Auto-fix issues
pnpm format       # Format code (Biome)
```

## Project Structure

```
app/                # Next.js App Router
├── (auth)/        # Authentication pages
├── (dashboard)/   # Protected dashboard
├── (admin)/       # Admin panel
└── api/           # API routes

components/        # React components
├── ui/           # ShadCN UI (50+ components)
├── admin/        # Admin components
└── settings/     # Settings forms

server/api/       # tRPC backend
├── trpc.ts      # tRPC setup
└── routers/     # API endpoints

lib/             # Utilities
├── auth/       # Better Auth config
├── email/      # Email service
└── trpc/       # tRPC clients

prisma/          # Database schema
emails/          # Email templates (React Email)
hooks/           # Custom React hooks
docs/            # Documentation
```

## Development Guidelines

### 1. Authentication
- Uses Better Auth with 7 methods (email, OAuth, magic links, passkeys, OTP, 2FA, SSO)
- Protected routes handled by middleware
- Admin access via `ADMIN_EMAILS` env variable
- See `docs/authentication.md` for details

### 2. Database Patterns
```typescript
// Always use Prisma from context
const data = await ctx.prisma.user.findMany()

// Multi-tenant filtering
where: { workspaceId: ctx.workspaceId }

// Use transactions for related operations
await prisma.$transaction([...])
```

### 3. tRPC Usage
```typescript
// Server Components
import { createServerCaller } from '@/lib/trpc/server'
const caller = await createServerCaller()
const data = await caller.user.get()

// Client Components
'use client'
import { trpc } from '@/lib/trpc/client'
const { data } = trpc.user.get.useQuery()
```

### 4. Component Patterns
- Use Server Components by default
- Add `'use client'` only when needed (interactivity, hooks)
- Prefer editing existing files over creating new ones
- Keep components focused and reusable

### 5. Security
- Input validation with Zod
- Rate limiting on sensitive endpoints
- Permission checks at UI and API levels
- Never trust client-side validation alone

### 6. Code Style
- TypeScript strict mode enabled
- Biome for formatting (tabs, single quotes, no semicolons)
- Oxlint for linting
- Husky pre-commit hooks run automatically

## Key Features

- **Multi-tenant workspaces** with data isolation
- **RBAC system** with 30+ granular permissions
- **Admin dashboard** with user management
- **Email system** with 6 pre-built templates
- **In-app notifications** with real-time updates
- **File uploads** via Supabase Storage
- **Analytics dashboard** with charts
- **API key management** with SHA-256 hashing
- **User impersonation** for support
- **Maintenance mode** with banners
- **Theme system** with 4 built-in themes

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection
- `DIRECT_URL` - Direct DB connection
- `BETTER_AUTH_SECRET` - Min 32 chars
- `BETTER_AUTH_URL` - App URL
- `NEXT_PUBLIC_APP_URL` - Public app URL

Optional:
- `ADMIN_EMAILS` - Admin access list
- `RESEND_API_KEY` - Email sending
- Supabase keys for storage/realtime
- OAuth credentials

## Documentation

Detailed documentation available in `/docs`:

- [Getting Started](docs/getting-started.md) - Setup and installation
- [Authentication](docs/authentication.md) - Auth system guide
- [RBAC & Permissions](docs/rbac.md) - Permission system
- [Workspace Management](docs/workspaces.md) - Multi-tenancy
- [Email System](docs/emails.md) - Email templates
- [Admin Dashboard](docs/admin.md) - Admin features
- [API Reference](docs/api.md) - tRPC endpoints
- [Deployment](docs/deployment.md) - Production deployment
- [Architecture](docs/architecture.md) - System design
- [Theme Management](docs/theming.md) - Dynamic themes
- [ShadCN Components](docs/shadcn-components.md) - UI components

## Known Issues

**Next.js 16 Build**: Production builds may fail with Turbopack error. Solutions:
1. Use Next.js 15 for production: `pnpm add next@15`
2. Wait for Next.js 16.1+ fixes
3. Development server works perfectly

## Important Notes

- Don't create new files unless necessary
- Avoid adding emojis unless requested
- Follow existing patterns in the codebase
- Check permissions before destructive operations
- Test changes thoroughly before committing