# Getting Started

Welcome to the Enterprise SaaS Template! This guide will help you set up and run the project locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (LTS recommended)
- **pnpm** (recommended), npm, or yarn
- **PostgreSQL database** (Supabase recommended for easy setup)
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourcompany/saas-template.git
cd saas-template
```

### 2. Install Dependencies

We recommend using pnpm for faster, more efficient package management:

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required - Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"

# Required - Authentication
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional - Admin Access
ADMIN_EMAILS="admin@example.com"

# Optional - Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your App Name"

# Optional - Supabase (for storage and realtime)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 4. Database Setup

Generate the Prisma client and set up your database:

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations (production)
pnpm db:migrate

# OR push schema directly (development)
pnpm db:push

# Optional: Open Prisma Studio to view your database
pnpm db:studio
```

### 5. Start Development Server

```bash
pnpm dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
saas-template/
├── app/                    # Next.js App Router
├── components/            # React components
├── server/               # Backend logic & tRPC
├── lib/                  # Utilities and configs
├── prisma/               # Database schema
├── emails/               # Email templates
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── docs/                 # Documentation
```

## Development Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema (dev only)
pnpm db:studio    # Open Prisma Studio

# Code Quality
pnpm lint         # Run linter
pnpm lint:fix     # Fix linting issues
pnpm format       # Format code
pnpm type-check   # TypeScript type checking
```

## First Steps After Setup

### 1. Create Your First Admin User

1. Sign up through the normal registration flow
2. Add your email to `ADMIN_EMAILS` in `.env.local`
3. Restart the development server
4. Access the admin dashboard at `/admin`

### 2. Configure Authentication Providers (Optional)

To enable OAuth providers, add these to your `.env.local`:

```env
# Google OAuth
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# GitHub OAuth
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# Microsoft OAuth
AUTH_MICROSOFT_ID="..."
AUTH_MICROSOFT_SECRET="..."
```

### 3. Set Up Email Service (Optional)

1. Create a [Resend](https://resend.com) account
2. Get your API key
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY="re_..."
   ```

### 4. Enable File Storage (Optional)

1. Create a [Supabase](https://supabase.com) project
2. Add credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   ```

## Common Issues & Solutions

### Database Connection Issues

**Problem**: Cannot connect to database
**Solution**:
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists

### Build Errors

**Problem**: TypeScript errors during build
**Solution**:
- Run `pnpm type-check` to identify issues
- The project allows builds with TS errors (see `next.config.mjs`)

### Authentication Issues

**Problem**: Authentication not working
**Solution**:
- Verify `BETTER_AUTH_SECRET` is at least 32 characters
- Check `BETTER_AUTH_URL` matches your app URL
- Ensure database migrations are up to date

## Next Steps

- Read the [Architecture Overview](./architecture.md)
- Set up [Authentication](./authentication.md)
- Configure [RBAC & Permissions](./rbac.md)
- Explore [Admin Features](./admin.md)

## Getting Help

- Check our [documentation](../README.md#documentation)
- Open an [issue on GitHub](https://github.com/yourcompany/saas-template/issues)
- Join our [community Discord](https://discord.gg/your-invite)