# Architecture Overview

Technical architecture and design patterns of the Enterprise SaaS Template.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  App Router │  │ React Comps  │  │   Hooks      │  │
│  │  (Pages)    │  │  (UI/UX)     │  │  (Logic)     │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ├── tRPC
                              │
┌─────────────────────────────────────────────────────────┐
│                      API Layer (tRPC)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routers   │  │  Procedures  │  │  Middleware  │  │
│  │  (Endpoints)│  │  (Business)  │  │   (Auth)     │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ├── Prisma ORM
                              │
┌─────────────────────────────────────────────────────────┐
│                    Data Layer (PostgreSQL)               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Tables    │  │   Indexes    │  │  Relations   │  │
│  │  (Entities) │  │  (Performance)│  │  (Integrity) │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **ShadCN UI** - Component library
- **Framer Motion** - Animations

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - ORM and database toolkit
- **Better Auth** - Authentication system
- **Zod** - Schema validation

### Database
- **PostgreSQL** - Primary database
- **Supabase** - Database hosting & realtime
- **Redis** (optional) - Caching layer

### Infrastructure
- **Vercel** - Deployment platform
- **Resend** - Email service
- **Supabase Storage** - File storage

## Directory Structure

```
saas-template/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes group
│   ├── (dashboard)/         # Dashboard routes group
│   ├── (admin)/            # Admin routes group
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── admin/             # Admin-specific
│   ├── analytics/         # Charts & metrics
│   ├── auth/              # Auth forms
│   ├── rbac/              # Permission components
│   ├── settings/          # Settings forms
│   └── workspace/         # Workspace management
├── server/                # Backend logic
│   └── api/              # tRPC implementation
│       ├── trpc.ts       # tRPC setup
│       └── routers/      # API routers
├── lib/                  # Utilities
│   ├── auth/            # Auth config
│   ├── email/           # Email service
│   ├── permissions/     # RBAC utilities
│   └── trpc/            # tRPC clients
├── hooks/               # Custom React hooks
├── emails/              # Email templates
├── prisma/              # Database schema
└── public/              # Static assets
```

## Design Patterns

### 1. Server Components by Default

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// Client Component (when needed)
'use client'
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <div onClick={() => setState()}>...</div>
}
```

### 2. Data Fetching Patterns

#### Server Components
```typescript
import { createServerCaller } from '@/lib/trpc/server'

export default async function Page() {
  const caller = await createServerCaller()
  const data = await caller.resource.get()
  return <View data={data} />
}
```

#### Client Components
```typescript
'use client'
import { trpc } from '@/lib/trpc/client'

export function Component() {
  const { data } = trpc.resource.get.useQuery()
  const mutation = trpc.resource.update.useMutation()
  return <Form onSubmit={mutation.mutate} />
}
```

### 3. Authentication Pattern

```typescript
// Protected route
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function ProtectedPage() {
  const { user } = await requireAuth()
  return <Dashboard user={user} />
}

// Optional auth
import { getAuthSession } from '@/lib/auth/auth-helpers'

export default async function PublicPage() {
  const { user } = await getAuthSession()
  return <Page isAuthenticated={!!user} />
}
```

### 4. Multi-Tenancy Pattern

```typescript
// Always filter by workspace
const data = await prisma.resource.findMany({
  where: {
    workspaceId: ctx.workspaceId,
    // other conditions
  }
})

// Workspace context
const member = await prisma.organizationMember.findFirst({
  where: {
    userId: ctx.userId,
    organizationId: workspaceId
  },
  include: { role: true }
})
```

### 5. Permission Pattern

```typescript
// UI level
<PermissionGuard permission="resource:update">
  <EditButton />
</PermissionGuard>

// API level
if (!hasPermission(userId, workspaceId, 'resource:update')) {
  throw new TRPCError({ code: 'FORBIDDEN' })
}
```

## Database Schema

### Core Models

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  avatarUrl       String?
  emailVerified   Boolean   @default(false)
  banned          Boolean   @default(false)
  organizations   OrganizationMember[]
  sessions        Session[]
  notifications   Notification[]
}

model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  logoUrl     String?
  archived    Boolean   @default(false)
  members     OrganizationMember[]
  roles       Role[]
  invitations Invitation[]
}

model OrganizationMember {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  roleId         String
  user           User         @relation()
  organization   Organization @relation()
  role           Role         @relation()

  @@unique([userId, organizationId])
}

model Role {
  id          String   @id @default(cuid())
  name        String
  permissions String[] // JSON array of permissions
  members     OrganizationMember[]
}
```

## Security Architecture

### Authentication Flow

```
User Login Request
    │
    ▼
Better Auth
    │
    ├── Email/Password ──► Bcrypt Validation
    ├── OAuth ──────────► Provider Validation
    ├── Magic Link ─────► Token Validation
    └── Passkeys ───────► WebAuthn Validation
    │
    ▼
Session Creation
    │
    ▼
JWT Token/Cookie
    │
    ▼
Protected Routes
```

### Authorization Flow

```
Request with Session
    │
    ▼
Middleware Auth Check
    │
    ▼
Route Handler
    │
    ▼
Permission Check
    │
    ├── Role Permissions
    ├── Resource Ownership
    └── Workspace Membership
    │
    ▼
Action Allowed/Denied
```

### Security Layers

1. **Network Level**
   - HTTPS enforcement
   - Security headers
   - CORS configuration

2. **Application Level**
   - Input validation (Zod)
   - SQL injection prevention (Prisma)
   - XSS protection (React)

3. **Session Level**
   - Secure cookies
   - CSRF protection
   - Session expiration

4. **Data Level**
   - Encryption at rest
   - Encrypted connections
   - PII protection

## Performance Architecture

### Caching Strategy

```typescript
// In-memory caching
const cache = new Map()

// Redis caching (optional)
await redis.set(key, JSON.stringify(data), 'EX', 3600)

// Next.js caching
export const revalidate = 3600 // ISR
export const dynamic = 'force-cache' // Static
```

### Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_org_slug ON "Organization"(slug);
CREATE INDEX idx_member ON "OrganizationMember"(userId, organizationId);

-- Composite indexes
CREATE INDEX idx_audit_user_action ON "AuditLog"(userId, action);
```

### Code Splitting

```typescript
// Dynamic imports
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <Skeleton /> }
)

// Route-based splitting (automatic with App Router)
```

## State Management

### Server State (tRPC + React Query)

```typescript
// Queries
const { data, isLoading } = trpc.resource.list.useQuery()

// Mutations with optimistic updates
const utils = trpc.useUtils()
const mutation = trpc.resource.update.useMutation({
  onMutate: async (newData) => {
    await utils.resource.list.cancel()
    const previous = utils.resource.list.getData()
    utils.resource.list.setData(undefined, newData)
    return { previous }
  }
})
```

### Client State

```typescript
// Local component state
const [state, setState] = useState()

// Context for shared state
const WorkspaceContext = createContext()
<WorkspaceContext.Provider value={workspace}>
  {children}
</WorkspaceContext.Provider>

// Zustand for complex client state (optional)
```

## Error Handling

### Error Boundaries

```typescript
// Global error boundary
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### API Error Handling

```typescript
// Consistent error responses
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Validation failed',
  cause: validationErrors
})

// Client error handling
mutation.mutate(data, {
  onError: (error) => {
    toast.error(error.message)
  }
})
```

## Testing Architecture

### Unit Tests
```typescript
// Component testing
render(<Component />)
expect(screen.getByText('Hello')).toBeInTheDocument()

// Hook testing
const { result } = renderHook(() => useCustomHook())
expect(result.current.value).toBe(expected)
```

### Integration Tests
```typescript
// API testing
const caller = createCaller({ session: mockSession })
const result = await caller.resource.create(data)
expect(result).toMatchObject(expected)
```

### E2E Tests
```typescript
// Playwright/Cypress
await page.goto('/login')
await page.fill('[name="email"]', 'test@example.com')
await page.click('button[type="submit"]')
await expect(page).toHaveURL('/dashboard')
```

## Deployment Architecture

```
GitHub Repository
    │
    ├── Push to main
    │
    ▼
CI/CD Pipeline (GitHub Actions)
    │
    ├── Run tests
    ├── Type checking
    ├── Linting
    └── Build
    │
    ▼
Vercel Deployment
    │
    ├── Preview (PR)
    └── Production (main)
    │
    ▼
Edge Network (CDN)
    │
    ▼
Users
```

## Monitoring & Observability

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics (Vercel Analytics)

### Infrastructure Monitoring
- Uptime monitoring
- Database metrics
- API response times

### Business Metrics
- User growth
- Feature usage
- Conversion rates

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- Load balancing ready

### Vertical Scaling
- Optimized queries
- Efficient caching
- Code splitting

### Database Scaling
- Read replicas
- Connection pooling
- Query optimization

## Best Practices

1. **Type Safety**: Leverage TypeScript throughout
2. **Component Reusability**: Build composable components
3. **Performance First**: Optimize for Core Web Vitals
4. **Security by Default**: Apply security at every layer
5. **Developer Experience**: Maintain clear patterns
6. **Documentation**: Keep docs up to date
7. **Testing**: Maintain good test coverage
8. **Monitoring**: Track everything important

## Next Steps

- Review [Getting Started](./getting-started.md)
- Understand [Authentication](./authentication.md)
- Learn about [Deployment](./deployment.md)