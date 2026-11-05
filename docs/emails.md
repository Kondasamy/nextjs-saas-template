# Emails

Transactional emails are React components in `emails/`, rendered with `react-email` and sent through [Resend](https://resend.com). There is no marketing-email integration (the `MAILCHIMP_API_KEY`, `LOOPS_API_KEY` and `CONVERTKIT_API_KEY` vars in `lib/env.ts` are unused).

## Where the code lives

| What | File |
| --- | --- |
| Templates | `emails/*.tsx` |
| Shared layout, header, footer, button | `emails/components/` |
| Send functions (`EmailService`) | `lib/email/service.ts` |
| Resend client | `lib/email/client.ts` (`resend` is `null` when `RESEND_API_KEY` is unset) |
| App name used in subjects and sender | `NAME` in `lib/constants.ts` |
| Dev preview route | `app/api/email/preview/route.ts` |
| Admin test-send route | `app/api/admin/emails/test/route.ts` (UI at `/admin/emails`) |
| Render check | `scripts/render-emails.ts` (`pnpm test:emails`) |

## Configuration

```env
RESEND_API_KEY=       # required to send anything
EMAIL_FROM_ADDRESS=   # default: noreply@<NAME lowercased, no spaces>.com
EMAIL_FROM_NAME=      # default: NAME from lib/constants.ts
```

Verify the sender domain in Resend before sending to real users.

## Templates and when they are sent

| Template | `EmailService` method | Sent by |
| --- | --- | --- |
| `verification.tsx` | `sendVerification` | Better Auth email verification (`lib/auth/config.ts`) |
| `password-reset.tsx` | `sendPasswordReset` | Better Auth password reset |
| `magic-link.tsx` | `sendMagicLink` | Better Auth magic link plugin |
| `two-factor.tsx` | `sendOtpCode` | Better Auth email OTP plugin (subject and copy vary by sign-in / email-verification / change-email) |
| `two-factor.tsx` | `send2FACode` | Admin test route only |
| `email-change-verification.tsx` | `sendEmailChangeVerification` | `user.requestEmailChange` (to the new address) |
| `email-change-notification.tsx` | `sendEmailChangeNotification` | `user.requestEmailChange` (to the old address) |
| `password-changed.tsx` | `sendPasswordChanged` | `user.changePassword` |
| `feedback.tsx` | `sendFeedback` | `feedback.submitFeedback`, to every address in `ADMIN_EMAILS` |
| `support.tsx` | `sendSupport` | `feedback.submitSupport`, to every address in `ADMIN_EMAILS` |
| `welcome.tsx` | `sendWelcome` | Admin test route only |
| `invitation.tsx` | `sendInvitation` | Admin test route only |

`EmailService.sendCustom(to, subject, html)` sends arbitrary HTML.

## Common tasks

Preview a template locally (`pnpm dev`, not available in production):

```
/api/email/preview?template=welcome|verification|password-reset|magic-link|invitation|two-factor
```

The other five templates have no preview case; use `pnpm test:emails` or add a case to the route.

Send a real test email: sign in as an admin, open `/admin/emails`, or `POST /api/admin/emails/test` with `{ template, email }`.

Add a template:

1. Create `emails/<name>.tsx` wrapping content in `EmailLayout` (it takes a `preview` prop). Export the component (default or named).
2. Add a `static async sendX(...)` to `EmailService` that calls `render(...)` then the module-level `sendEmail({ to, subject, html })`.
3. If the template uses a prop not in the `sample` object in `scripts/render-emails.ts`, add it there, or `pnpm test:emails` (run in CI) fails with "missing prop rendered" or "link with no target".
4. Optionally add a case to the preview route and the admin test route.

## Gotchas

- `EmailService` methods throw when `RESEND_API_KEY` is missing. The Better Auth hooks check for the key first and only log; other callers wrap sends in try/catch. Follow that pattern so a missing key never breaks a request.
- Workspace invitations do not send an email. `invitations.create` and `bulkInviteMembers` only create records; share an invite link (`invitations.createInviteLink`, opened at `/invite/[token]`) instead.
- No welcome email is sent on sign-up.
- `lib/email/client.ts` also exports a `sendEmail` that returns `{ success, error }` instead of throwing; nothing uses it. Use `EmailService`.
- Email sends are not queued or retried.

## Related

[authentication.md](./authentication.md) for which auth flows send email, [admin.md](./admin.md) for the test-send page.
