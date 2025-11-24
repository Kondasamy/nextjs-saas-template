# Security Policy

## 🔒 Reporting Security Vulnerabilities

We take the security of our software seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:
- Open a public GitHub issue for security vulnerabilities
- Post about the vulnerability on social media
- Exploit the vulnerability for any reason

### Please DO:
- Email us at: **kondasamy@pm.me**
- Include detailed steps to reproduce the vulnerability
- Allow us reasonable time to fix the issue before disclosure

## 📧 What to Include in Your Report

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and attack scenarios
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Proof of Concept**: Code snippets or screenshots if applicable
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have suggestions for fixing

## ⏱ Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: 60-90 days

## 🛡 Security Features

This template includes multiple security layers:

### Authentication & Authorization
- **Better Auth Integration**: 7 authentication methods
- **2FA/MFA Support**: TOTP-based two-factor authentication
- **Passkeys**: WebAuthn support for passwordless authentication
- **Session Management**: Secure session handling with device tracking
- **RBAC System**: Granular permission system with 30+ permission levels

### Data Protection
- **Password Hashing**: Secure bcrypt hashing
- **API Key Hashing**: SHA-256 hashing for API keys
- **Environment Variables**: Sensitive data stored in environment variables
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS protection + security headers

### Security Headers
```typescript
// Implemented in proxy.ts and next.config.mjs
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive
```

### Rate Limiting
```typescript
// Three-tier rate limiting system
- Default: 100 requests per 15 minutes
- Strict: 10 requests per 15 minutes
- Auth: 5 attempts per 15 minutes
```

### Audit Logging
- All sensitive actions are logged
- User impersonation tracking
- Permission changes tracking
- Failed authentication attempts

## 🔐 Security Best Practices

### For Users
1. **Use Strong Passwords**: Minimum 8 characters with mixed case, numbers, and symbols
2. **Enable 2FA**: Always enable two-factor authentication when available
3. **Regular Updates**: Keep dependencies and packages updated
4. **Secure Environment**: Never commit `.env` files or secrets to version control

### For Developers
1. **Input Validation**: Always validate and sanitize user input
2. **Authentication Checks**: Use `requireAuth()` for protected routes
3. **Permission Guards**: Use `PermissionGuard` components for UI elements
4. **Error Handling**: Never expose sensitive information in error messages
5. **Dependency Management**: Regularly update and audit dependencies

## 🚨 Known Security Considerations

### Environment Variables
Ensure all required environment variables are properly set:
- `BETTER_AUTH_SECRET`: Must be at least 32 characters
- `DATABASE_URL`: Use SSL connections in production
- `ADMIN_EMAILS`: Restrict admin access carefully

### Database Security
- Always use parameterized queries (handled by Prisma)
- Enable SSL for database connections in production
- Regular database backups
- Implement proper data retention policies

### File Uploads
- File size limits enforced (5MB for images by default)
- File type validation (whitelist approach)
- Secure storage with Supabase Storage
- Virus scanning recommended for production

## 📋 Security Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] Database SSL is enabled
- [ ] Audit logging is active
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies are up to date
- [ ] Admin access is restricted
- [ ] 2FA is enforced for admin accounts

## 🔄 Updates and Patches

We regularly update dependencies and patch security vulnerabilities:

- **Dependencies**: Updated monthly or as needed
- **Security Patches**: Applied as soon as available
- **Breaking Changes**: Communicated in release notes

### Checking for Updates
```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Audit for vulnerabilities
pnpm audit
```

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
- [Better Auth Security](https://better-auth.com/docs/security)

## 🏆 Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. With your permission, we'll acknowledge your contribution in our security advisories.

## 📝 Policy Changes

This security policy may be updated from time to time. We will notify users of any significant changes through our repository.

---

**Last Updated**: 24 November 2025
**Version**: 1.0.0