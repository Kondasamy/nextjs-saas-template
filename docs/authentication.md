# Authentication

Auth is [Better Auth](https://better-auth.com) with the Prisma adapter. Sessions are cookie-based, last 7 days and refresh daily.

## Where the code lives

| What | File |
| --- | --- |
| Server config (methods, plugins, email hooks, session) | `lib/auth/config.ts` |
| Browser client (`authClient`, `signIn`, `signUp`, `signOut`, `useSession`) | `lib/auth/client.ts` |
| HTTP handler for `/api/auth/*` | `app/api/auth/[...all]/route.ts` |
| Server helpers that redirect to `/login` | `lib/auth/auth-helpers.ts` |
| Server helpers that throw instead | `lib/auth/server.ts` |
| Admin checks | `lib/auth/admin-helpers.ts` (see [admin.md](./admin.md)) |
| Route protection and security headers | `proxy.ts` |
| Auth pages | `app/(auth)/` (login, signup, forgot-password, reset-password, verify-email, verify-otp, setup-2fa) |
| Auth UI components | `components/auth/` |
| 2FA, sessions, passkey management | `server/api/routers/user.ts` |

## Sign-in methods

| Method | How it is wired |
| --- | --- |
| Email + password | `emailAndPassword` in config. Passwords hashed with bcrypt. Email verification is required only when `NODE_ENV=production`. |
| Google, GitHub, Microsoft OAuth | `socialProviders`. Each is enabled only when both its client ID and secret are set. |
| Magic link | `magicLink` plugin. |
| Email OTP | `emailOTP` plugin. Sign-in only for existing accounts (`disableSignUp: true`). |
| Passkeys | `@better-auth/passkey` plugin. Sign-in UI exists (`components/auth/passkey-auth.tsx`); there is no UI to register a passkey yet. Users can list, rename and remove passkeys via `user.listPasskeys` / `renamePasskey` / `removePasskey`. |
| TOTP 2FA | Custom, not a Better Auth plugin. `user.setup2FA`, `verify2FA`, `disable2FA`, `get2FAStatus`, `regenerateBackupCodes` (uses `speakeasy` + `qrcode`, stored in the `TwoFactorAuth` model). **2FA is not checked at sign-in**, so enabling it does not protect the account yet. |

There is no SSO, SAML or Okta support. The `SAML_*` and `OKTA_*` vars in `lib/env.ts` are unused.

Password reset is link-based only (`requestPasswordReset` / `resetPassword`). The email-OTP reset endpoints are disabled in `disabledPaths`.

## Environment variables

```env
BETTER_AUTH_SECRET=   # min 32 chars; also signs impersonation cookies
BETTER_AUTH_URL=      # server base URL
NEXT_PUBLIC_APP_URL=  # client base URL used by lib/auth/client.ts

GOOGLE_CLIENT_ID=     GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=     GITHUB_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=  MICROSOFT_CLIENT_SECRET=

RESEND_API_KEY=       # without it, auth emails are skipped and only logged
```

OAuth callback URL for each provider: `{BETTER_AUTH_URL}/api/auth/callback/{google|github|microsoft}`.

## Common tasks

Read the session in a Server Component:

```tsx
import { requireAuth } from '@/lib/auth/auth-helpers' // redirects to /login if signed out
const session = await requireAuth()

import { getAuthSession } from '@/lib/auth/auth-helpers' // returns null if signed out
const session = await getAuthSession()
```

Read the session in a Client Component: `useAuth()` from `hooks/use-auth.ts` returns `{ user, session, isLoading, isAuthenticated }`.

In tRPC, use `protectedProcedure`; `ctx.user` and `ctx.session` are set (see [api.md](./api.md)).

Client calls used by the app's UI:

```ts
signIn.email({ email, password })
signIn.social({ provider: 'google' })
signIn.magicLink({ email })
authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
signIn.emailOtp({ email, otp })
signIn.passkey()
signUp.email({ email, password, name })
authClient.requestPasswordReset({ email, redirectTo })
authClient.resetPassword({ token, newPassword })
signOut()
```

Password change, email change, session listing/revocation, account export and deletion are tRPC procedures in `server/api/routers/user.ts`, not Better Auth client calls.

Add an OAuth provider: add it to `socialProviders` in `lib/auth/config.ts`, add its env vars to `lib/env.ts`, and add a button in `components/auth/social-login.tsx`.

## Route protection

`proxy.ts` runs on every non-API, non-static request. Public paths: `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/verify-otp`. Everything else redirects signed-out users to `/login?redirect=<path>`. Signed-in users hitting an auth page are sent to `/`. API routes are excluded from the matcher, so each route and tRPC procedure must check auth itself.

## Gotchas

- Password reset is currently broken end to end: `app/(auth)/forgot-password/page.tsx` sends `redirectTo: .../auth/reset-password` but the page lives at `/reset-password`, and `/reset-password` is not in the public list in `proxy.ts`, so a signed-out user would be redirected to `/login` anyway.
- Two `requireAuth` functions exist: `lib/auth/auth-helpers.ts` redirects, `lib/auth/server.ts` throws. Pick deliberately.
- Rate limiting: `/api/trpc` uses `defaultRateLimiter` (100 req / 15 min per IP, in-memory) from `lib/rate-limit.ts`. `authRateLimiter` is defined there but not applied to `/api/auth`. In-memory limits do not work across multiple instances.
- Password rules are only a client-side `min(8)` in the forms; there is no server-side complexity policy.
- Email send failures in auth hooks are logged and swallowed, so sign-up succeeds even if the email never goes out.
- The `banned` flag only blocks admin access (`requireAdmin`); banned users can still sign in.

## Related

[emails.md](./emails.md) for auth email templates, [admin.md](./admin.md) for admin access and impersonation, [rbac.md](./rbac.md) and [workspaces.md](./workspaces.md) for authorization inside workspaces.
