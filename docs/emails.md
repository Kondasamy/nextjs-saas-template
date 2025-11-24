# Email System

Comprehensive email system with React Email templates and automatic sending via Better Auth.

## Overview

The email system provides:
- **6 pre-built templates** with consistent styling
- **Automatic sending** for auth flows
- **React Email** for component-based templates
- **Resend** integration for delivery
- **Preview route** for development

## Configuration

### Environment Setup

```env
# Required for email sending
RESEND_API_KEY="re_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your App Name"
```

### Email Service

Centralized email service in `lib/email/service.ts`:

```typescript
import { EmailService } from '@/lib/email/service'

// All email methods
EmailService.sendWelcome(email, name)
EmailService.sendVerification(email, verificationUrl, code)
EmailService.sendPasswordReset(email, name, resetUrl)
EmailService.sendMagicLink(email, magicLink)
EmailService.sendInvitation(email, inviterName, orgName, role, url)
EmailService.send2FACode(email, name, code)
```

## Email Templates

### Template Structure

All templates use a consistent layout:

```tsx
// emails/components/email-layout.tsx
export function EmailLayout({ children }) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body>
          <Container>
            <EmailHeader />
            {children}
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

### Available Templates

#### 1. Welcome Email

Sent automatically after user signup:

```tsx
// emails/welcome.tsx
export default function WelcomeEmail({
  name,
  email
}: {
  name: string
  email: string
}) {
  return (
    <EmailLayout>
      <Heading>Welcome to {APP_NAME}!</Heading>
      <Text>Hi {name},</Text>
      <Text>Thanks for signing up...</Text>
      <Button href={loginUrl}>Get Started</Button>
    </EmailLayout>
  )
}
```

#### 2. Verification Email

Email address verification:

```tsx
// emails/verification.tsx
export default function VerificationEmail({
  verificationUrl,
  code
}: {
  verificationUrl: string
  code: string
}) {
  return (
    <EmailLayout>
      <Heading>Verify Your Email</Heading>
      <Text>Your verification code: {code}</Text>
      <Button href={verificationUrl}>Verify Email</Button>
    </EmailLayout>
  )
}
```

#### 3. Password Reset

Password recovery email:

```tsx
// emails/password-reset.tsx
export default function PasswordResetEmail({
  name,
  resetUrl
}: {
  name: string
  resetUrl: string
}) {
  return (
    <EmailLayout>
      <Heading>Reset Your Password</Heading>
      <Text>Hi {name},</Text>
      <Text>Click below to reset your password:</Text>
      <Button href={resetUrl}>Reset Password</Button>
    </EmailLayout>
  )
}
```

#### 4. Magic Link

Passwordless authentication:

```tsx
// emails/magic-link.tsx
export default function MagicLinkEmail({
  magicLink
}: {
  magicLink: string
}) {
  return (
    <EmailLayout>
      <Heading>Your Magic Link</Heading>
      <Text>Click to sign in:</Text>
      <Button href={magicLink}>Sign In</Button>
    </EmailLayout>
  )
}
```

#### 5. Team Invitation

Workspace invitation email:

```tsx
// emails/invitation.tsx
export default function InvitationEmail({
  inviterName,
  organizationName,
  role,
  invitationUrl
}: InvitationProps) {
  return (
    <EmailLayout>
      <Heading>You're Invited!</Heading>
      <Text>{inviterName} invited you to join {organizationName}</Text>
      <Text>Role: {role}</Text>
      <Button href={invitationUrl}>Accept Invitation</Button>
    </EmailLayout>
  )
}
```

#### 6. Two-Factor Code

2FA verification code:

```tsx
// emails/two-factor.tsx
export default function TwoFactorEmail({
  name,
  code
}: {
  name: string
  code: string
}) {
  return (
    <EmailLayout>
      <Heading>Your 2FA Code</Heading>
      <Text>Hi {name},</Text>
      <Text>Your verification code:</Text>
      <CodeBlock>{code}</CodeBlock>
    </EmailLayout>
  )
}
```

## Better Auth Integration

Emails are automatically sent via Better Auth hooks:

```typescript
// lib/auth/config.ts
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await EmailService.sendPasswordReset(
        user.email,
        user.name,
        url
      )
    }
  },
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      await EmailService.sendMagicLink(email, url)
    }
  },
  // ... other configurations
})
```

## Development Tools

### Email Preview

Preview emails during development:

```bash
# Start dev server
pnpm dev

# Visit preview URLs
http://localhost:3000/api/email/preview?template=welcome
http://localhost:3000/api/email/preview?template=verification
http://localhost:3000/api/email/preview?template=password-reset
http://localhost:3000/api/email/preview?template=magic-link
http://localhost:3000/api/email/preview?template=invitation
http://localhost:3000/api/email/preview?template=two-factor
```

**Note:** Preview is only available in development mode.

### Testing Emails

Without Resend API key, emails log to console:

```typescript
// lib/email/service.ts
if (!process.env.RESEND_API_KEY) {
  console.log('📧 Email Preview:')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('HTML:', html)
  return { id: 'console-preview' }
}
```

## Custom Templates

### Creating New Templates

1. Create template file:

```tsx
// emails/custom-notification.tsx
import { EmailLayout } from './components/email-layout'
import { Heading, Text, Button } from '@react-email/components'

export default function CustomNotification({
  title,
  message,
  actionUrl
}: Props) {
  return (
    <EmailLayout>
      <Heading>{title}</Heading>
      <Text>{message}</Text>
      <Button href={actionUrl}>Take Action</Button>
    </EmailLayout>
  )
}
```

2. Add to EmailService:

```typescript
// lib/email/service.ts
static async sendCustomNotification(
  email: string,
  title: string,
  message: string,
  actionUrl: string
) {
  const html = await render(
    CustomNotification({ title, message, actionUrl })
  )

  return EmailService.send({
    to: email,
    subject: title,
    html
  })
}
```

3. Add preview support:

```typescript
// app/api/email/preview/route.ts
case 'custom-notification':
  component = CustomNotification({
    title: 'Important Update',
    message: 'Your attention is needed...',
    actionUrl: 'https://example.com/action'
  })
  break
```

## Styling Emails

### Using Tailwind

React Email supports Tailwind CSS:

```tsx
import { Tailwind } from '@react-email/tailwind'

<Tailwind>
  <div className="bg-gray-100 p-4">
    <h1 className="text-2xl font-bold text-blue-600">
      Welcome!
    </h1>
  </div>
</Tailwind>
```

### Custom Styles

Use inline styles for better compatibility:

```tsx
<div
  style={{
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px'
  }}
>
  Content
</div>
```

## Email Providers

### Resend (Default)

Current integration uses Resend:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
  to: email,
  subject: subject,
  html: html
})
```

### Alternative Providers

Easy to swap providers:

```typescript
// SendGrid
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
await sgMail.send({...})

// Postmark
import { ServerClient } from 'postmark'
const client = new ServerClient(process.env.POSTMARK_KEY)
await client.sendEmail({...})

// AWS SES
import { SES } from 'aws-sdk'
const ses = new SES()
await ses.sendEmail({...}).promise()
```

## Marketing Emails

### Integration Options

Support for marketing platforms:

```typescript
// Mailchimp
await mailchimp.lists.addListMember(listId, {
  email_address: email,
  status: 'subscribed'
})

// Loops
await loops.createContact({
  email: email,
  properties: { name, role }
})

// ConvertKit
await convertkit.addSubscriber({
  email: email,
  first_name: name
})
```

## Best Practices

### 1. Consistent Branding

- Use company colors
- Include logo in header
- Consistent footer with links
- Clear call-to-action buttons

### 2. Mobile Responsiveness

- Use responsive tables
- Minimum font size 14px
- Touch-friendly buttons (44px height)
- Single column layout

### 3. Email Deliverability

- Verify sender domain
- Set up SPF/DKIM/DMARC
- Use descriptive subject lines
- Include unsubscribe links

### 4. Testing

- Test across email clients
- Check spam score
- Verify links work
- Test with real data

## Troubleshooting

### Common Issues

**Emails not sending:**
- Verify RESEND_API_KEY is set
- Check sender domain is verified
- Review Resend dashboard for errors

**Emails in spam:**
- Verify domain authentication
- Check spam score
- Review email content
- Add unsubscribe link

**Template not rendering:**
- Check React Email syntax
- Verify component imports
- Test in preview route

## Next Steps

- Set up [Admin Dashboard](./admin.md)
- Configure [Deployment](./deployment.md)
- Review [API Documentation](./api.md)