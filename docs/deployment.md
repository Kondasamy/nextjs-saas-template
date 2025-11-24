# Deployment Guide

Complete guide for deploying your SaaS application to production.

## Prerequisites

Before deployment, ensure you have:
- Production database (PostgreSQL)
- Domain name configured
- SSL certificate (automatic with most platforms)
- Environment variables ready

## Deployment Platforms

### Vercel (Recommended)

#### 1. Prepare Your Repository

```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect via GitHub
# 1. Go to vercel.com
# 2. Import your GitHub repository
# 3. Configure environment variables
# 4. Deploy
```

#### 3. Environment Variables

Set these in Vercel dashboard:

```env
# Required
DATABASE_URL=
DIRECT_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional but recommended
ADMIN_EMAILS=
RESEND_API_KEY=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=
```

#### 4. Database Configuration

For Vercel, use connection pooling:

```env
# Pooled connection for app
DATABASE_URL="postgres://user:pass@host/db?pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgres://user:pass@host/db"
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add environment variables
railway variables set DATABASE_URL="..."
```

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables

### Self-Hosting (VPS)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install nginx
sudo apt install nginx
```

#### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/yourrepo/saas-template.git
cd saas-template

# Install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local
nano .env.local # Edit variables

# Build application
pnpm build

# Start with PM2
pm2 start pnpm --name saas-app -- start
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/saas-app
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Database Setup

### Supabase (Recommended)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection strings from Settings → Database
3. Run migrations:

```bash
# Set DATABASE_URL to direct connection
pnpm db:migrate
```

### PostgreSQL (Self-hosted)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE saas_production;
CREATE USER saas_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saas_production TO saas_user;
\q

# Run migrations
DATABASE_URL="postgresql://saas_user:your_password@localhost/saas_production" pnpm db:migrate
```

### PlanetScale

```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Create database
pscale database create saas-app

# Get connection string
pscale connect saas-app main --format mysql

# Update Prisma schema for MySQL
# Change provider to "mysql"
```

## Environment Configuration

### Production Environment Variables

```env
# App Configuration
NODE_ENV=production
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (with SSL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Security
BETTER_AUTH_SECRET=<generate-32-char-secret>

# Admin
ADMIN_EMAILS="admin@yourdomain.com"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your App"

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# OAuth (if using)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
```

### Generate Secrets

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Build Optimization

### Next.js Configuration

```javascript
// next.config.mjs
export default {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

### Build Analysis

```bash
# Analyze bundle size
ANALYZE=true pnpm build

# Check build output
pnpm build
```

## Monitoring

### Application Monitoring

#### Vercel Analytics

```bash
pnpm add @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

<Analytics />
```

#### Sentry

```bash
pnpm add @sentry/nextjs

# Configure Sentry
npx @sentry/wizard@latest -i nextjs
```

### Database Monitoring

```sql
-- Check slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor connections
SELECT count(*) FROM pg_stat_activity;
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

## Performance Optimization

### Caching

#### Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Configure in app
pnpm add ioredis
```

```typescript
// lib/redis.ts
import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL)
```

#### Edge Caching

```typescript
// Use Next.js ISR
export const revalidate = 3600 // 1 hour

// Or dynamic caching
export const dynamic = 'force-cache'
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_user_email ON "User" (email);
CREATE INDEX idx_workspace_slug ON "Organization" (slug);
CREATE INDEX idx_member_user_org ON "OrganizationMember" (userId, organizationId);
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={url}
  alt="..."
  width={400}
  height={300}
  placeholder="blur"
  loading="lazy"
/>
```

## Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] Admin emails configured
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking setup

## Backup Strategy

### Database Backups

#### Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Upload to S3/storage
```

#### Supabase Backups

Supabase provides automatic daily backups with point-in-time recovery.

### Application Backups

```bash
# Backup uploads/files
rsync -av /path/to/uploads /backup/location

# Git repository is your code backup
git push --all
```

## Rollback Strategy

### Using Vercel

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Manual Rollback

```bash
# Keep previous build
cp -r .next .next.backup

# Rollback if needed
mv .next.backup .next
pm2 restart saas-app
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check connection string format
- Verify firewall rules
- Ensure SSL mode matches provider

**Build Failures**
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

**Environment Variables Not Loading**
- Verify variable names match exactly
- Check for quotes in values
- Restart application after changes

**OAuth Not Working**
- Update redirect URLs in provider settings
- Verify client ID and secret
- Check BETTER_AUTH_URL matches domain

## Health Checks

### API Health Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error },
      { status: 503 }
    )
  }
}
```

### Monitoring Script

```bash
#!/bin/bash
# health-check.sh
response=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/api/health)
if [ $response != "200" ]; then
  # Send alert
  echo "Site is down!"
fi
```

## Scaling

### Horizontal Scaling

- Use Vercel's automatic scaling
- Or configure multiple PM2 instances:

```bash
pm2 start pnpm --name saas-app -i max -- start
```

### Database Scaling

- Use connection pooling
- Read replicas for queries
- Consider database sharding

## Next Steps

- Review [Architecture](./architecture.md)
- Set up monitoring
- Configure backups
- Test disaster recovery