<div align="center">
  <h1>🚀 Enterprise SaaS Template</h1>
  <p>
    <strong>Production-ready SaaS starter with Next.js 16, Better Auth, tRPC, and comprehensive RBAC</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

A modern, full-featured SaaS template that includes everything you need to launch your next enterprise application. Built with the latest technologies and best practices, featuring complete authentication, workspace management, RBAC, analytics, and admin dashboard.

## ✨ Features

### 🔐 **Authentication & Security**
- **7 authentication methods** via Better Auth (Email, OAuth, Magic Links, Passkeys, OTP, 2FA, SSO)
- **RBAC system** with granular permissions (30+ permission levels)
- **Rate limiting** with multiple tiers
- **Security headers** (HSTS, CSP, X-Frame-Options)
- **User impersonation** for admin support with audit logging

### 🏢 **Workspace Management**
- **Multi-tenant architecture** with workspace isolation
- **Workspace templates** - Clone workspaces with settings and permissions
- **Archive/restore** workspaces with audit trail
- **Invitation links** with usage limits
- **Bulk operations** for member management
- **API key management** with secure SHA-256 hashing

### 📊 **Analytics & Admin**
- **Admin dashboard** with user management and system metrics
- **Analytics dashboard** with Recharts visualizations
- **Audit logs** with filtering and CSV export
- **Activity tracking** and user engagement metrics
- **Maintenance mode** with scheduled end times

### 💌 **Communications**
- **Email system** with React Email templates (6 pre-built)
- **In-app notifications** with real-time updates
- **Toast notifications** for user feedback
- **Webhook support** for external integrations

### 🎨 **UI & Experience**
- **50+ ShadCN UI components**
- **Dark/light theme** with next-themes
- **10 motion components** with Framer Motion
- **Responsive design** with Tailwind CSS 4
- **Loading skeletons** and error boundaries
- **Internationalization** ready with next-intl

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Kondasamy/nextjs-saas-template.git
cd nextjs-saas-template

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local

# Set up database
pnpm db:generate
pnpm db:migrate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth (7 methods)
- **API:** tRPC for end-to-end type safety
- **Storage:** Supabase (optional)
- **Styling:** Tailwind CSS 4 + ShadCN UI
- **Email:** React Email + Resend
- **Analytics:** Recharts
- **Code Quality:** Biome + Oxlint + Husky

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (admin)/           # Admin-only routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── admin/            # Admin components
│   └── settings/         # Settings components
├── server/               # Backend logic
│   └── api/routers/      # tRPC routers
├── lib/                  # Utilities and configs
├── prisma/               # Database schema
├── emails/               # Email templates
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Required
DATABASE_URL=
DIRECT_URL=
BETTER_AUTH_SECRET=        # Min 32 chars
BETTER_AUTH_URL=           # Your app URL
NEXT_PUBLIC_APP_URL=

# Optional
ADMIN_EMAILS=              # Comma-separated admin emails
RESEND_API_KEY=           # For email sending
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

See [`.env.local.example`](.env.local.example) for all available options.

### Admin Access

Add admin emails to `ADMIN_EMAILS` environment variable:

```env
ADMIN_EMAILS="admin@example.com,manager@example.com"
```

## 📚 Documentation

- [Getting Started](docs/getting-started.md)
- [Authentication Guide](docs/authentication.md)
- [RBAC & Permissions](docs/rbac.md)
- [Workspace Management](docs/workspaces.md)
- [Email System](docs/emails.md)
- [Admin Dashboard](docs/admin.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Architecture Overview](docs/architecture.md)
- [Theme Management](docs/theming.md)
- [ShadCN Components](docs/shadcn-components.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Check linting
pnpm format       # Format code
pnpm db:studio    # Open Prisma Studio
```

## 🐛 Known Issues

- **Next.js 16 Build:** Production builds may fail with Turbopack. Use Next.js 15 for production or wait for 16.1+. Development works perfectly.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with amazing open source projects:
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Better Auth](https://better-auth.com)
- [tRPC](https://trpc.io)
- [ShadCN UI](https://ui.shadcn.com)
- [Supabase](https://supabase.com)

---

<div align="center">
  Made with ❤️ by the community
</div>