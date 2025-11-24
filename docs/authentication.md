# Authentication Guide

This template uses [Better Auth](https://better-auth.com) for a comprehensive authentication system supporting multiple methods.

## Supported Authentication Methods

### 1. Email & Password
Traditional email/password authentication with:
- Email verification
- Password strength validation
- Secure bcrypt hashing

### 2. OAuth Providers
Pre-configured OAuth support for:
- Google
- GitHub
- Microsoft
- Easy to add more providers

### 3. Magic Links
Passwordless authentication via email:
- One-click login
- Secure token generation
- Automatic expiration

### 4. Passkeys (WebAuthn)
Modern biometric authentication:
- Face ID / Touch ID
- Hardware security keys
- Platform authenticators

### 5. One-Time Passwords (OTP)
Email-based OTP codes:
- 6-digit verification codes
- Time-based expiration
- Rate limited attempts

### 6. Two-Factor Authentication (2FA)
TOTP-based 2FA with:
- QR code generation
- Authenticator app support
- Backup codes

### 7. Enterprise SSO
SAML and OKTA integration for enterprise customers.

## Configuration

### Basic Setup

The authentication system is configured in `lib/auth/config.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  // ... other configurations
})
```

### OAuth Provider Setup

Add OAuth credentials to your `.env.local`:

```env
# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Microsoft OAuth
AUTH_MICROSOFT_ID="your-microsoft-client-id"
AUTH_MICROSOFT_SECRET="your-microsoft-client-secret"
```

### Email Configuration

Emails are sent automatically for:
- Account verification
- Password reset
- Magic links
- OTP codes
- 2FA codes

Configure email service:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your App Name"
```

## Using Authentication

### In React Components

#### Client Components

```tsx
'use client'

import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, session, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Welcome {user.name}!</div>
}
```

#### Server Components

```tsx
import { getAuthSession } from '@/lib/auth/auth-helpers'

export default async function Page() {
  const { user, session } = await getAuthSession()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.name}!</div>
}
```

### Protected Routes

#### Using Middleware

Routes are protected via `middleware.ts`:

```typescript
// Automatically protects:
// - /dashboard/*
// - /settings/*
// - /admin/*
// - /workspace/*
```

#### Using Helper Functions

```tsx
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function ProtectedPage() {
  const { user } = await requireAuth()
  // User is guaranteed to be authenticated
  return <div>Protected content</div>
}
```

### Sign In/Out

#### Sign In

```tsx
import { authClient } from '@/lib/auth/client'

// Email & Password
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123'
})

// OAuth
await authClient.signIn.social({
  provider: 'google'
})

// Magic Link
await authClient.signIn.magicLink({
  email: 'user@example.com'
})
```

#### Sign Out

```tsx
await authClient.signOut()
```

## Session Management

### Session Data

Sessions include:
- User information
- Device tracking
- IP address
- User agent
- Last activity

### Session Helpers

```typescript
// Get current session
const { session, user } = await getAuthSession()

// Check if user is authenticated
if (session) {
  console.log('User is logged in:', user.email)
}

// Get session in tRPC
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    const session = await getAuthSession()
    if (!session) throw new Error('Unauthorized')
    return next({ ctx: { ...ctx, session } })
  })
```

## Security Features

### Password Requirements

Enforced password policy:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

Authentication endpoints are rate-limited:
- 5 attempts per 15 minutes for auth endpoints
- IP-based tracking
- Automatic blocking on excess attempts

### Security Headers

Applied automatically:
- CSRF protection
- XSS protection
- Secure cookies
- HTTP-only sessions

## Email Templates

Pre-built email templates for all auth flows:

### Available Templates
- `welcome.tsx` - New user welcome
- `verification.tsx` - Email verification
- `password-reset.tsx` - Password reset
- `magic-link.tsx` - Magic link login
- `two-factor.tsx` - 2FA codes

### Customizing Templates

Edit templates in `emails/` directory:

```tsx
// emails/welcome.tsx
export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <EmailLayout>
      <Text>Welcome {name}!</Text>
      {/* Your custom content */}
    </EmailLayout>
  )
}
```

## Advanced Features

### Custom User Fields

Add custom fields to user model:

```prisma
// prisma/schema.prisma
model User {
  // ... existing fields
  bio        String?
  timezone   String?
  language   String?
  avatarUrl  String?
}
```

### Social Account Linking

Users can link multiple social accounts:
- Link/unlink providers
- Account merging
- Primary email selection

### Impersonation

Admins can impersonate users:
- Audit logged
- Time-limited sessions
- Visual indicator

## Troubleshooting

### Common Issues

**Email verification not working**
- Check RESEND_API_KEY is set
- Verify EMAIL_FROM_ADDRESS is valid
- Check spam folder

**OAuth redirect errors**
- Verify redirect URLs in provider settings
- Check BETTER_AUTH_URL matches your domain
- Ensure provider credentials are correct

**Session not persisting**
- Check BETTER_AUTH_SECRET is set
- Verify cookies are enabled
- Check domain configuration

## API Reference

### Auth Client Methods

```typescript
authClient.signIn.email({ email, password })
authClient.signIn.social({ provider })
authClient.signIn.magicLink({ email })
authClient.signIn.otp({ email, otp })
authClient.signUp({ email, password, name })
authClient.signOut()
authClient.verifyEmail({ token })
authClient.resetPassword({ token, newPassword })
authClient.changePassword({ currentPassword, newPassword })
authClient.changeEmail({ newEmail })
authClient.twoFactor.enable()
authClient.twoFactor.disable()
authClient.twoFactor.verify({ code })
```

### Helper Functions

```typescript
// Server-side helpers
getAuthSession() // Get current session
requireAuth()    // Require authentication
requireAdmin()   // Require admin access
isUserAdmin(email) // Check if user is admin
```

## Next Steps

- Set up [RBAC & Permissions](./rbac.md)
- Configure [Workspace Management](./workspaces.md)
- Implement [Admin Features](./admin.md)