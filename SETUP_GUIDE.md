# 🚀 Setup Guide - Enterprise SaaS Template

Complete setup guide for the Next.js 16 Enterprise SaaS Template with authentication, analytics, admin dashboard, and more.

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm** installed
- **PostgreSQL** database (recommended: Supabase, Neon, or PlanetScale)
- **Resend** account for email (optional but recommended)

## 🔧 Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo>
cd saas-template

# Install dependencies
pnpm install
```

## 📝 Step 2: Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure required variables:**

### Required Variables

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (REQUIRED)
BETTER_AUTH_SECRET="generate-a-random-32-char-string"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generating BETTER_AUTH_SECRET

```bash
# Generate a secure random string
openssl rand -base64 32
```

## 🗄️ Step 3: Database Setup

1. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

2. **Push database schema:**
   ```bash
   pnpm db:push
   ```

   Or use migrations for production:
   ```bash
   pnpm db:migrate
   ```

3. **Verify database:**
   ```bash
   pnpm db:studio
   ```
   Opens Prisma Studio at http://localhost:5555

## 🎨 Step 4: Customize Branding

Edit `/lib/constants.ts`:

```typescript
export const NAME = 'Your Company Name'
export const EMAIL_URL = 'support@yourcompany.com'
export const EMAIL_URL_LINK = 'mailto:support@yourcompany.com'
export const IMAGE_URL = '/images/logo.png'
```

## 🚀 Step 5: Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## 👤 Step 6: Create Your First User

1. Go to http://localhost:3000/signup
2. Create an account with your email
3. Check your terminal for the verification link (if Resend is not configured)

## 🛡️ Step 7: Setup Admin Access

Add your email to the admin list in `.env.local`:

```env
ADMIN_EMAILS="your@email.com,another@email.com"
```

Now you can access:
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/audit` - Audit logs

## 📧 Step 8: Email Configuration (Optional)

### Using Resend

1. Sign up at https://resend.com
2. Get your API key
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY="re_..."
   EMAIL_FROM_ADDRESS="noreply@yourcompany.com"
   EMAIL_FROM_NAME="Your Company"
   ```

### Test Email Templates

Visit http://localhost:3000/api/email/preview?template=welcome

Available templates:
- `welcome`
- `verification`
- `password-reset`
- `magic-link`
- `invitation`
- `two-factor`

## 🔐 Step 9: OAuth Setup (Optional)

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Create OAuth App
3. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   ```

## 📦 Step 10: Supabase Setup (Optional)

For file storage and realtime features:

1. Create project at https://supabase.com
2. Get credentials from Project Settings > API
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   ```

## 🏗️ Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🧪 Testing

```bash
# Run linter
pnpm lint

# Format code
pnpm format

# Pre-commit checks
pnpm pre-commit
```

## 📱 Features Available

### ✅ Authentication
- Email/Password
- Magic Links
- OAuth (Google, GitHub, Microsoft)
- Passkeys (WebAuthn)
- OTP
- 2FA/TOTP

### ✅ Dashboard
- Analytics charts
- User growth metrics
- Activity feed
- Stats cards

### ✅ Settings Pages
- Profile management
- Account settings
- Security settings
- Team management
- Notification preferences

### ✅ Admin Dashboard
- User management
- Audit logs
- System statistics
- Ban/unban users

### ✅ Multi-Tenancy
- Workspace/organization management
- Team invitations
- RBAC with custom roles
- Permission management

## 🔧 Common Issues

### Build Errors

If you encounter Turbopack errors, use webpack instead:

Edit `next.config.mjs`:
```js
experimental: {
  turbo: false
}
```

### Database Connection Issues

Ensure your DATABASE_URL includes connection pooling for serverless:
```
?pgbouncer=true&connection_limit=1
```

### Email Not Sending

Check your Resend API key and FROM address. In development, emails are logged to console if Resend is not configured.

## 📚 Project Structure

```
saas-template/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Main app pages
│   ├── (admin)/         # Admin dashboard
│   └── api/             # API routes
├── components/
│   ├── analytics/       # Dashboard components
│   ├── auth/            # Auth components
│   ├── settings/        # Settings pages
│   └── admin/           # Admin components
├── emails/              # Email templates
├── hooks/               # React hooks
├── lib/                 # Utilities
├── prisma/              # Database schema
└── server/              # tRPC routers
```

## 🎯 Next Steps

1. **Customize the dashboard** - Add your app-specific features
2. **Configure Supabase** - Enable file uploads and realtime
3. **Set up monitoring** - Add Sentry for error tracking
4. **Deploy** - Deploy to Vercel, Railway, or your preferred platform

## 📖 Documentation

- [ACTION_CHECKLIST.md](./ACTION_CHECKLIST.md) - Implementation checklist
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Detailed implementation plan
- [CLAUDE.md](./CLAUDE.md) - Development commands and architecture

## 🤝 Support

For issues or questions:
- Check the documentation
- Review existing issues
- Create a new issue with details

---

**Happy coding!** 🚀
