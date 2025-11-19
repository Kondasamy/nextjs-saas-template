# Database Setup Guide

## Supabase Connection Strings

When setting up your Supabase database, you need two connection strings:

### 1. DATABASE_URL (Connection Pooler)
- **Port**: 6543
- **Purpose**: Regular queries and application connections
- **Format**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

### 2. DIRECT_URL (Direct Connection)
- **Port**: 5432
- **Purpose**: Database migrations (Prisma needs direct connection)
- **Format**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres`

## How to Get Your Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. You'll see different connection modes:
   - **Connection Pooling (Transaction)**: Use this for `DATABASE_URL` (port 6543)
   - **Direct Connection**: Use this for `DIRECT_URL` (port 5432)

## Example .env.local Configuration

```env
# Connection Pooler (for regular queries)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## Troubleshooting

### Error: Can't reach database server

If you get connection errors:

1. **Check your connection strings** - Make sure they're copied correctly from Supabase
2. **Verify the port** - DIRECT_URL should use port 5432, DATABASE_URL should use 6543
3. **Check your IP** - Supabase might have IP restrictions. Go to Settings → Database → Connection Pooling and check if your IP is allowed
4. **Try without pooler** - As a test, you can use the direct connection for both:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

### Note on Connection Pooling

- **Port 6543**: Transaction mode pooler (recommended for most apps)
- **Port 5432**: Direct connection (required for migrations, schema changes)

For production, always use the pooler (port 6543) for `DATABASE_URL` to avoid connection limits.

