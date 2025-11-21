# User & Workspace Management Implementation Plan

**Document Version:** 1.0
**Last Updated:** November 21, 2024
**Status:** Planning Phase

## Executive Summary

This document outlines the implementation plan for completing user and workspace/organization management features in the Enterprise SaaS Template. The plan is organized into 4 phases based on priority and impact, with detailed action items for each feature.

**Current State:** 65% complete (core infrastructure exists)
**Target State:** 100% production-ready user and workspace management
**Estimated Timeline:** 10-15 days
**Team Size:** 1-2 developers

---

## Phase 1: Critical Blocking Issues (Days 1-3)

*Priority: CRITICAL | Must be completed for basic functionality*

### 1.1 Member Role Management Endpoints ⚠️ BLOCKING

**Issue:** UI calls non-existent tRPC procedures
**Location:** `server/api/routers/workspace.ts`
**Impact:** Team management page is non-functional

**Action Items:**

- [ ] **1.1.1** Add `updateMemberRole` procedure to workspace router
  ```typescript
  // server/api/routers/workspace.ts
  updateMemberRole: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      userId: z.string(),
      roleId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions (must be owner or have member:manage permission)
      // Verify role exists in organization
      // Prevent demoting last owner
      // Update OrganizationMember record
      // Create audit log entry
    })
  ```
  - Verify caller has permission (`*` or `member:manage`)
  - Check that role exists and belongs to the organization
  - Prevent removing the last owner
  - Create audit log entry
  - Return updated member data

- [ ] **1.1.2** Add `removeMember` procedure to workspace router
  ```typescript
  removeMember: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      // Prevent removing last owner
      // Delete OrganizationMember record
      // Create audit log entry
      // Send notification to removed user
    })
  ```
  - Verify caller has permission (`*` or `member:remove`)
  - Prevent removing the last owner
  - Delete OrganizationMember record (cascade will handle relations)
  - Create audit log entry
  - Send notification to removed user (optional)

- [ ] **1.1.3** Update team-members-table.tsx to use correct role IDs
  - Currently hardcoded values ("owner", "admin", "member", "viewer")
  - Fetch available roles from `permissions.listRoles` query
  - Dynamically populate SelectItem components

**Files to Modify:**
- `server/api/routers/workspace.ts` (add 2 procedures)
- `components/settings/team-members-table.tsx` (fetch roles dynamically)

**Dependencies:** None
**Testing:** Manual testing of role updates and member removal
**Estimated Time:** 4-6 hours

---

### 1.2 Workspace Switcher Component

**Issue:** Users in multiple workspaces have no way to switch context
**Location:** New component + layout updates
**Impact:** Multi-tenant functionality is broken

**Action Items:**

- [ ] **1.2.1** Create workspace context provider
  ```typescript
  // lib/workspace/workspace-context.tsx
  interface WorkspaceContextType {
    currentWorkspace: Organization | null
    workspaces: Organization[]
    switchWorkspace: (id: string) => void
    isLoading: boolean
  }
  ```
  - Use React Context API
  - Store current workspace ID in localStorage
  - Fetch workspaces list on mount
  - Provide switch function

- [ ] **1.2.2** Create workspace switcher component
  ```typescript
  // components/workspace/workspace-switcher.tsx
  ```
  - Dropdown menu with workspace list
  - Show current workspace with checkmark
  - Display workspace logo/avatar
  - Add "Create Workspace" option
  - Add keyboard navigation (Cmd+K support optional)

- [ ] **1.2.3** Add switcher to AppSidebar header
  - Place above navigation menu
  - Show current workspace name and logo
  - Responsive design for mobile

- [ ] **1.2.4** Update all workspace-dependent queries
  - Replace hardcoded `user?.organizations?.[0]` with context
  - Update dashboard page
  - Update settings/team page
  - Update analytics queries

**Files to Create:**
- `lib/workspace/workspace-context.tsx`
- `components/workspace/workspace-switcher.tsx`

**Files to Modify:**
- `app/layout.tsx` (wrap with WorkspaceProvider)
- `components/app-sidebar.tsx` (add switcher)
- `app/(dashboard)/page.tsx`
- `app/(dashboard)/settings/team/page.tsx`

**Dependencies:** None
**Testing:** Test switching between workspaces, verify data isolation
**Estimated Time:** 6-8 hours

---

### 1.3 Transfer Ownership Endpoint

**Issue:** No way to transfer workspace ownership
**Location:** `server/api/routers/workspace.ts`
**Impact:** Users cannot delegate ownership

**Action Items:**

- [ ] **1.3.1** Add `transferOwnership` procedure
  ```typescript
  transferOwnership: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      newOwnerId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify caller is current owner
      // Verify new owner is member
      // Find or create Owner role
      // Update both members' roles
      // Create audit log
      // Send notifications
    })
  ```
  - Check caller is current owner (has role with `permissions: ["*"]`)
  - Verify target user is already a member
  - Create transaction to update both roles atomically
  - Demote current owner to admin
  - Promote new owner
  - Create audit log entry
  - Send email notifications to both users

- [ ] **1.3.2** Add transfer ownership UI to team settings
  ```typescript
  // components/settings/transfer-ownership-dialog.tsx
  ```
  - Dialog with member selection
  - Confirmation step with "type workspace name" verification
  - Warning about consequences
  - Show in team members table actions for owners only

**Files to Create:**
- `components/settings/transfer-ownership-dialog.tsx`

**Files to Modify:**
- `server/api/routers/workspace.ts`
- `components/settings/team-members-table.tsx`

**Dependencies:** None
**Testing:** Test ownership transfer, verify permissions update correctly
**Estimated Time:** 4-6 hours

---

## Phase 2: High Priority Features (Days 4-7)

*Priority: HIGH | Essential for production readiness*

### 2.1 Email Change Flow

**Location:** Backend endpoint + connect existing form
**Files:** `server/api/routers/user.ts`, `components/settings/email-change-form.tsx`

**Action Items:**

- [ ] **2.1.1** Add `requestEmailChange` procedure
  ```typescript
  requestEmailChange: protectedProcedure
    .input(z.object({ newEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Check email not already in use
      // Generate verification token
      // Store pending email change in Verification table
      // Send verification email to NEW email
      // Send notification to OLD email
    })
  ```

- [ ] **2.1.2** Add `confirmEmailChange` procedure
  ```typescript
  confirmEmailChange: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify token
      // Update user email
      // Delete verification record
      // Invalidate all sessions
      // Send confirmation email
    })
  ```

- [ ] **2.1.3** Create email verification page
  - `app/verify-email-change/page.tsx`
  - Handle token from URL query param
  - Show success/error states

- [ ] **2.1.4** Update EmailService with new template
  - `emails/email-change-verification.tsx`
  - `emails/email-change-notification.tsx` (to old email)
  - Add methods to EmailService

- [ ] **2.1.5** Connect form to endpoints
  - Update `email-change-form.tsx` to call new procedures
  - Add loading states
  - Show success message with next steps

**Estimated Time:** 6-8 hours

---

### 2.2 Password Change Flow

**Location:** Backend endpoint + connect existing form
**Files:** `server/api/routers/user.ts`, `components/settings/password-change-form.tsx`

**Action Items:**

- [ ] **2.2.1** Add `changePassword` procedure
  ```typescript
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify current password via Better Auth
      // Update password via Better Auth
      // Invalidate all other sessions (keep current)
      // Send confirmation email
      // Create audit log
    })
  ```

- [ ] **2.2.2** Integrate with Better Auth password update
  - Use Better Auth's password update API
  - Handle Better Auth errors (wrong password, weak password)

- [ ] **2.2.3** Add password strength validator
  - Create utility function in `lib/utils/password.ts`
  - Validate: length, uppercase, lowercase, numbers, special chars
  - Return strength score and feedback

- [ ] **2.2.4** Update password-change-form.tsx
  - Connect to changePassword mutation
  - Add real-time password strength indicator
  - Show validation errors
  - Add success toast

- [ ] **2.2.5** Create email template
  - `emails/password-changed.tsx`
  - Include device info and timestamp
  - Add "wasn't you?" link to reset password

**Estimated Time:** 4-6 hours

---

### 2.3 Session Management

**Location:** New page + endpoints
**Files:** `app/(dashboard)/settings/security/page.tsx`, `server/api/routers/user.ts`

**Action Items:**

- [ ] **2.3.1** Add `listSessions` procedure
  ```typescript
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all active sessions for current user
    // Include device info, location (from IP), last active
    // Mark current session
  })
  ```

- [ ] **2.3.2** Add `revokeSession` procedure
  ```typescript
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify session belongs to user
      // Delete session from database
      // Create audit log
    })
  ```

- [ ] **2.3.3** Add `revokeAllSessions` procedure
  - Revoke all sessions except current
  - Send notification email
  - Create audit log

- [ ] **2.3.4** Create sessions table component
  ```typescript
  // components/settings/active-sessions-table.tsx
  ```
  - Show device name, browser, OS, IP address
  - Show last active timestamp
  - Mark current session (disable revoke button)
  - Add "Revoke" button for each session
  - Add "Revoke all other sessions" button

- [ ] **2.3.5** Add to security settings page
  - Insert above or below 2FA section
  - Add card with title and description

**Estimated Time:** 5-7 hours

---

### 2.4 Two-Factor Authentication UI

**Location:** Connect existing schema to UI
**Files:** `app/(dashboard)/settings/security/page.tsx`, new components

**Action Items:**

- [ ] **2.4.1** Add 2FA tRPC procedures
  ```typescript
  // server/api/routers/user.ts
  setup2FA: protectedProcedure.mutation() // Generate secret, return QR
  verify2FA: protectedProcedure.input().mutation() // Verify code, enable 2FA
  disable2FA: protectedProcedure.input().mutation() // Disable with password
  generateBackupCodes: protectedProcedure.mutation() // Generate new codes
  ```

- [ ] **2.4.2** Install 2FA dependencies
  ```bash
  pnpm add speakeasy qrcode
  pnpm add -D @types/speakeasy @types/qrcode
  ```

- [ ] **2.4.3** Create 2FA setup dialog
  ```typescript
  // components/settings/two-factor-setup-dialog.tsx
  ```
  - Step 1: Scan QR code
  - Step 2: Enter verification code
  - Step 3: Save backup codes
  - Show success message

- [ ] **2.4.4** Create 2FA management component
  ```typescript
  // components/settings/two-factor-settings.tsx
  ```
  - Show enabled/disabled status
  - "Enable 2FA" button (opens setup dialog)
  - "Disable 2FA" button (requires password confirmation)
  - "Generate new backup codes" button
  - Display last enabled date

- [ ] **2.4.5** Add to security settings page

**Estimated Time:** 8-10 hours

---

### 2.5 Passkey Management UI

**Location:** Connect existing schema to UI
**Files:** `app/(dashboard)/settings/security/page.tsx`, new components

**Action Items:**

- [ ] **2.5.1** Add passkey tRPC procedures
  ```typescript
  // server/api/routers/user.ts
  listPasskeys: protectedProcedure.query()
  registerPasskey: protectedProcedure.input().mutation()
  removePasskey: protectedProcedure.input().mutation()
  renamePasskey: protectedProcedure.input().mutation()
  ```

- [ ] **2.5.2** Integrate with Better Auth passkey API
  - Use Better Auth's WebAuthn implementation
  - Handle registration ceremony
  - Handle authentication ceremony

- [ ] **2.5.3** Create passkey list component
  ```typescript
  // components/settings/passkey-list.tsx
  ```
  - Table showing passkey name, device, last used, created date
  - "Add Passkey" button
  - "Remove" button for each passkey
  - "Rename" inline edit

- [ ] **2.5.4** Create passkey registration dialog
  ```typescript
  // components/settings/passkey-registration-dialog.tsx
  ```
  - Explain what passkeys are
  - Show browser compatibility warning
  - Trigger WebAuthn registration
  - Allow naming the passkey

- [ ] **2.5.5** Add to security settings page

**Estimated Time:** 6-8 hours

---

### 2.6 Workspace Logo Upload

**Location:** Workspace settings
**Files:** New workspace settings page, storage integration

**Action Items:**

- [ ] **2.6.1** Create workspace settings page
  ```typescript
  // app/(dashboard)/settings/workspace/page.tsx
  ```
  - General settings (name, description, slug)
  - Logo upload
  - Danger zone (delete workspace)

- [ ] **2.6.2** Add workspace settings to sidebar
  - Update `components/app-sidebar.tsx`
  - Add under Settings section

- [ ] **2.6.3** Create logo upload component
  ```typescript
  // components/settings/workspace-logo-upload.tsx
  ```
  - Image preview
  - Drag-and-drop support
  - Crop functionality (use `react-image-crop`)
  - Size validation (max 5MB)
  - Format validation (PNG, JPG, SVG)

- [ ] **2.6.4** Use existing storage router
  - Upload via `storage.upload` mutation
  - Store URL in organization.logo field
  - Update via `workspace.update` mutation

- [ ] **2.6.5** Display workspace logo in switcher
  - Update WorkspaceSwitcher component
  - Show logo avatar instead of initials

**Estimated Time:** 5-6 hours

---

## Phase 3: Medium Priority Features (Days 8-11)

*Priority: MEDIUM | Enhances user experience*

### 3.1 User Profile Extensions

**Action Items:**

- [ ] **3.1.1** Update User schema
  ```prisma
  model User {
    // ... existing fields
    bio         String?
    timezone    String?  @default("UTC")
    language    String?  @default("en")
  }
  ```
  - Run `pnpm db:generate && pnpm db:push`

- [ ] **3.1.2** Update profile settings form
  - Add bio textarea (max 500 chars)
  - Add timezone selector (use `spacetime` library)
  - Add language selector
  - Update tRPC procedure input validation

- [ ] **3.1.3** Update `user.updateProfile` procedure
  - Add new optional fields to input schema
  - Update database mutation

- [ ] **3.1.4** Create profile completeness indicator
  ```typescript
  // components/profile/profile-completeness.tsx
  ```
  - Calculate % complete (name, email, image, bio, timezone)
  - Show progress bar
  - Show checklist of missing items
  - Display in profile settings page

**Estimated Time:** 3-4 hours

---

### 3.2 Account Data Export (GDPR)

**Action Items:**

- [ ] **3.2.1** Add `exportAccountData` procedure
  ```typescript
  exportAccountData: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Gather all user data: profile, workspaces, notifications, audit logs
      // Format as JSON
      // Upload to storage (temporary, expires in 24h)
      // Send email with download link
      // Create audit log
    })
  ```

- [ ] **3.2.2** Create export button in account settings
  - Add to delete account section
  - Show explanation of what's included
  - Loading state during export
  - Toast notification when ready

- [ ] **3.2.3** Create email template
  - `emails/data-export-ready.tsx`
  - Include download link with expiration time
  - GDPR compliance notice

**Estimated Time:** 4-5 hours

---

### 3.3 Workspace Invitation Links

**Action Items:**

- [ ] **3.3.1** Update Invitation schema
  ```prisma
  model Invitation {
    // ... existing fields
    type        String  @default("email")  // "email" | "link"
    maxUses     Int?    // null = unlimited
    usedCount   Int     @default(0)
  }
  ```

- [ ] **3.3.2** Add `createInviteLink` procedure
  ```typescript
  createInviteLink: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      roleId: z.string(),
      maxUses: z.number().optional(),
      expiresInDays: z.number().default(7),
    }))
    .mutation()
  ```

- [ ] **3.3.3** Create invite links management UI
  ```typescript
  // components/settings/invite-links-table.tsx
  ```
  - List active invite links
  - Show uses/max uses
  - Copy link button
  - Revoke link button
  - Create new link button

- [ ] **3.3.4** Create public accept invitation page
  - `app/invite/[token]/page.tsx`
  - Show workspace info
  - Require sign-in or sign-up
  - Auto-accept after authentication

- [ ] **3.3.5** Add to team settings page
  - New card: "Invite Links"
  - Below or above pending invitations

**Estimated Time:** 6-7 hours

---

### 3.4 Bulk Member Operations

**Action Items:**

- [ ] **3.4.1** Add `bulkInviteMembers` procedure
  ```typescript
  bulkInviteMembers: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      emails: z.array(z.string().email()),
      roleId: z.string(),
    }))
    .mutation()
  ```
  - Validate all emails
  - Check for duplicates
  - Create multiple invitations in transaction
  - Send all emails (use Promise.allSettled)
  - Return success/failure report

- [ ] **3.4.2** Update invite dialog for bulk mode
  - Add "Bulk Invite" tab
  - Textarea for email list (comma or newline separated)
  - Parse and validate emails
  - Show preview list
  - Display results after submission

- [ ] **3.4.3** Add `bulkUpdateMemberRoles` procedure
  ```typescript
  bulkUpdateMemberRoles: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      updates: z.array(z.object({
        userId: z.string(),
        roleId: z.string(),
      })),
    }))
    .mutation()
  ```

- [ ] **3.4.4** Add `bulkRemoveMembers` procedure

- [ ] **3.4.5** Add bulk selection to members table
  - Checkbox column
  - "Select all" checkbox in header
  - Bulk action bar when items selected
  - Actions: Change role, Remove

**Estimated Time:** 7-8 hours

---

### 3.5 User Activity History

**Action Items:**

- [ ] **3.5.1** Add `getUserActivityLog` procedure
  ```typescript
  getUserActivityLog: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Fetch audit logs for current user
      // Include IP, user agent, timestamp
      // Filter out sensitive actions
    })
  ```

- [ ] **3.5.2** Create activity log component
  ```typescript
  // components/settings/activity-log.tsx
  ```
  - Timeline view of actions
  - Show action type, timestamp, IP address, device
  - Pagination
  - Filter by action type
  - Export to CSV

- [ ] **3.5.3** Add to account settings page
  - New card: "Account Activity"
  - Show last 10 actions
  - "View all" link to dedicated page

- [ ] **3.5.4** Create dedicated activity page (optional)
  - `app/(dashboard)/settings/activity/page.tsx`
  - Full activity log with filters
  - Date range selector
  - Search functionality

**Estimated Time:** 5-6 hours

---

### 3.6 Workspace Usage Metrics

**Action Items:**

- [ ] **3.6.1** Add `getWorkspaceUsage` procedure
  ```typescript
  getWorkspaceUsage: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Calculate member count
      // Calculate storage used (if implemented)
      // Calculate API calls (if tracked)
      // Get active members (last 30 days)
    })
  ```

- [ ] **3.6.2** Create usage dashboard component
  ```typescript
  // components/workspace/usage-dashboard.tsx
  ```
  - Stat cards for each metric
  - Progress bars for quotas (if implemented)
  - Charts for trends

- [ ] **3.6.3** Add to workspace settings page
  - New section: "Usage & Limits"
  - Show all metrics
  - Add upgrade CTA if near limits (future billing integration)

**Estimated Time:** 4-5 hours

---

## Phase 4: Low Priority Features (Days 12-15)

*Priority: LOW | Future enhancements*

### 4.1 Workspace Templates

**Action Items:**

- [ ] **4.1.1** Add `cloneWorkspace` procedure
  - Copy workspace settings (name, description, logo)
  - Copy roles and permissions
  - Add current user as owner
  - Don't copy members

- [ ] **4.1.2** Add "Clone Workspace" button
  - In workspace settings danger zone
  - Dialog with new workspace name input
  - Show what will be cloned

**Estimated Time:** 3-4 hours

---

### 4.2 Workspace Archiving

**Action Items:**

- [ ] **4.2.1** Update Organization schema
  ```prisma
  model Organization {
    // ... existing
    archived    Boolean   @default(false)
    archivedAt  DateTime?
    archivedBy  String?
  }
  ```

- [ ] **4.2.2** Add `archiveWorkspace` procedure
  - Set archived flag
  - Restrict access to archived workspaces
  - Don't show in workspace switcher

- [ ] **4.2.3** Add `unarchiveWorkspace` procedure

- [ ] **4.2.4** Add admin UI to view archived workspaces

**Estimated Time:** 3-4 hours

---

### 4.3 Advanced Permission Management UI

**Action Items:**

- [ ] **4.3.1** Create permission constants file
  ```typescript
  // lib/permissions/constants.ts
  export const PERMISSIONS = {
    WORKSPACE: {
      UPDATE: 'workspace:update',
      DELETE: 'workspace:delete',
    },
    MEMBER: {
      INVITE: 'member:invite',
      REMOVE: 'member:remove',
      MANAGE: 'member:manage',
    },
    ROLE: {
      CREATE: 'role:create',
      UPDATE: 'role:update',
      DELETE: 'role:delete',
    },
  } as const
  ```

- [ ] **4.3.2** Create permission checker utility
  ```typescript
  // lib/permissions/checker.ts
  export function hasPermission(
    userPermissions: string[],
    requiredPermission: string
  ): boolean
  ```

- [ ] **4.3.3** Create permission browser UI
  ```typescript
  // components/settings/permission-browser.tsx
  ```
  - Tree view of all permissions
  - Grouped by category
  - Show description for each
  - Used in role editor

- [ ] **4.3.4** Create role editor dialog
  - Select from all available permissions
  - Visual permission builder
  - Save custom roles

**Estimated Time:** 6-8 hours

---

### 4.4 Workspace API Keys

**Action Items:**

- [ ] **4.4.1** Create APIKey schema
  ```prisma
  model APIKey {
    id             String   @id @default(cuid())
    organizationId String
    organization   Organization @relation(...)
    name           String
    key            String   @unique
    hashedKey      String   // Store hashed version
    lastUsedAt     DateTime?
    expiresAt      DateTime?
    createdById    String
    createdBy      User     @relation(...)
    createdAt      DateTime @default(now())
  }
  ```

- [ ] **4.4.2** Add API key tRPC procedures
  - `createAPIKey`, `listAPIKeys`, `revokeAPIKey`

- [ ] **4.4.3** Create API key management UI

- [ ] **4.4.4** Add API key authentication middleware

**Estimated Time:** 8-10 hours

---

### 4.5 SSO Configuration UI (Advanced)

**Action Items:**

- [ ] **4.5.1** Create SSO configuration schema
- [ ] **4.5.2** Create SSO setup wizard
- [ ] **4.5.3** SAML metadata upload
- [ ] **4.5.4** Test SSO connection

**Estimated Time:** 12-15 hours

---

## Implementation Guidelines

### Development Workflow

1. **Start with tRPC procedures** - Backend first approach
2. **Add validation** - Use Zod schemas for all inputs
3. **Create UI components** - Build reusable components
4. **Connect components** - Wire up tRPC mutations/queries
5. **Add loading states** - Use React Suspense where possible
6. **Add error handling** - Use toast notifications
7. **Add audit logging** - Track all important actions
8. **Test manually** - Verify functionality works
9. **Update documentation** - Document new features

### Code Standards

- **TypeScript**: Use strict mode, avoid `any`
- **Naming**: Use descriptive names, follow existing patterns
- **Components**: Keep components small and focused
- **Procedures**: One procedure = one action
- **Validation**: Always validate inputs with Zod
- **Errors**: Use TRPCError with appropriate codes
- **Permissions**: Always check permissions in mutations
- **Audit**: Log sensitive operations to AuditLog

### Security Checklist

- [ ] Validate all user inputs
- [ ] Check permissions before mutations
- [ ] Use parameterized queries (Prisma does this)
- [ ] Hash sensitive data (passwords, API keys)
- [ ] Rate limit sensitive endpoints
- [ ] Create audit logs for important actions
- [ ] Send notifications for security changes
- [ ] Use HTTPS in production
- [ ] Validate file uploads (size, type)
- [ ] Sanitize user-generated content

### Performance Checklist

- [ ] Use database indexes for frequent queries
- [ ] Paginate large lists
- [ ] Use React Suspense for loading states
- [ ] Lazy load heavy components
- [ ] Optimize images
- [ ] Add caching where appropriate
- [ ] Use `Promise.all` for parallel queries
- [ ] Minimize database queries in loops

---

## Testing Requirements

### Manual Testing Checklist

For each feature, test:

- [ ] **Happy path** - Feature works as expected
- [ ] **Error cases** - Handles errors gracefully
- [ ] **Permissions** - Non-authorized users blocked
- [ ] **Edge cases** - Boundary conditions work
- [ ] **Mobile** - Responsive on small screens
- [ ] **Dark mode** - UI looks correct in dark theme
- [ ] **Loading states** - Shows skeleton/spinner
- [ ] **Success feedback** - Toast notifications work

### Test Scenarios by Phase

**Phase 1:**
- Update member role to different levels
- Remove member from workspace
- Transfer ownership between users
- Switch between multiple workspaces
- Verify data isolation between workspaces

**Phase 2:**
- Change email with verification
- Change password and verify sessions
- View and revoke sessions
- Enable/disable 2FA
- Add and remove passkeys
- Upload workspace logo

**Phase 3:**
- Update profile with extended fields
- Export account data
- Create and use invite links
- Bulk invite multiple members
- View activity history

**Phase 4:**
- Clone workspace
- Archive and restore workspace
- Manage custom roles
- Create and use API keys

---

## Success Criteria

### Functional Requirements

- ✅ All critical blocking issues resolved
- ✅ Team management fully functional
- ✅ Multi-workspace support working
- ✅ All security features implemented
- ✅ GDPR compliance features present
- ✅ Audit logging complete

### Non-Functional Requirements

- ✅ Page load < 3 seconds
- ✅ API response < 500ms
- ✅ Zero console errors
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Dark mode supported
- ✅ TypeScript strict mode passes

### Documentation Requirements

- ✅ All new endpoints documented
- ✅ Component props documented
- ✅ README updated with new features
- ✅ Environment variables documented
- ✅ Migration guide created

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Better Auth integration issues | High | Test thoroughly, have fallback plan |
| Database migration failures | High | Test migrations in staging first |
| Performance degradation | Medium | Add pagination, optimize queries |
| Breaking changes to existing features | High | Extensive testing, backward compatibility |

### Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Stick to prioritized phases |
| Underestimated complexity | Medium | Add 20% buffer to estimates |
| Blocking dependencies | Medium | Identify dependencies early |

---

## Progress Tracking

### Phase 1 Progress: 0/3 Complete
- [ ] Member role management (1.1)
- [ ] Workspace switcher (1.2)
- [ ] Transfer ownership (1.3)

### Phase 2 Progress: 0/6 Complete
- [ ] Email change (2.1)
- [ ] Password change (2.2)
- [ ] Session management (2.3)
- [ ] 2FA UI (2.4)
- [ ] Passkey management (2.5)
- [ ] Workspace logo (2.6)

### Phase 3 Progress: 0/6 Complete
- [ ] Profile extensions (3.1)
- [ ] Data export (3.2)
- [ ] Invite links (3.3)
- [ ] Bulk operations (3.4)
- [ ] Activity history (3.5)
- [ ] Usage metrics (3.6)

### Phase 4 Progress: 0/5 Complete
- [ ] Workspace templates (4.1)
- [ ] Workspace archiving (4.2)
- [ ] Permission management UI (4.3)
- [ ] API keys (4.4)
- [ ] SSO UI (4.5)

---

## Next Steps

### Week 1: Critical Foundation
1. Start with Phase 1.1 (member role management) - 4-6 hours
2. Continue with Phase 1.2 (workspace switcher) - 6-8 hours
3. Finish Phase 1 with Phase 1.3 (transfer ownership) - 4-6 hours

### Week 2: Security & Settings
4. Implement Phase 2 features sequentially
5. Test all security features thoroughly
6. Update documentation

### Week 3+: Enhancements
7. Implement Phase 3 features based on priority
8. Consider Phase 4 features as time permits
9. Focus on polish and optimization

---

## Appendix

### Useful Commands

```bash
# Generate Prisma client after schema changes
pnpm db:generate && pnpm db:push

# Run linting
pnpm lint

# Format code
pnpm format

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run database migrations (production)
pnpm db:migrate
```

### File Structure Reference

```
server/api/routers/
├── user.ts           # User management endpoints
├── workspace.ts      # Workspace management endpoints
├── permissions.ts    # Role & permission endpoints
└── invitations.ts    # Team invitation endpoints

components/
├── settings/         # Settings page components
├── workspace/        # Workspace management components
└── ui/              # shadcn/ui components

app/
├── (dashboard)/     # Protected dashboard routes
├── (admin)/         # Admin-only routes
└── (auth)/          # Authentication routes
```

### Related Documentation

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Overall project plan
- [CLAUDE.md](../CLAUDE.md) - Project architecture guide
- [THEMING_GUIDE.md](./THEMING_GUIDE.md) - Theme customization
- [SHADCN_COMPONENTS_GUIDE.md](./SHADCN_COMPONENTS_GUIDE.md) - UI components

---

**End of Document**
