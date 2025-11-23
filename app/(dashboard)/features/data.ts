export interface Feature {
	uid: string
	title: string
	description: string
	cover?: string
	category:
		| 'core'
		| 'auth'
		| 'workspace'
		| 'communication'
		| 'storage'
		| 'analytics'
		| 'ui'
		| 'production'
	link?: string
	url?: string
	github?: string
	tutorial?: string
	youtube?: string
	tags?: string[]
}

export const FEATURES: Feature[] = [
	// Core Infrastructure
	{
		uid: 'feature--1',
		title: 'Next.js 16 with App Router',
		description:
			'Built with Next.js 16 and React 19, featuring the App Router for optimal performance, server components, and modern React patterns.',
		cover: 'https://placehold.co/800x450/0066FF/FFFFFF?text=Next.js+16',
		category: 'core',
		tags: ['Framework', 'React', 'Server Components'],
	},
	{
		uid: 'feature--2',
		title: 'TypeScript for Type Safety',
		description:
			'End-to-end type safety with TypeScript, ensuring robust code quality and developer experience across the entire stack.',
		cover: 'https://placehold.co/800x450/3178C6/FFFFFF?text=TypeScript',
		category: 'core',
		tags: ['Type Safety', 'Developer Experience'],
	},
	{
		uid: 'feature--3',
		title: 'Prisma ORM with PostgreSQL',
		description:
			'Type-safe database access with Prisma ORM, connected to PostgreSQL (Supabase) with comprehensive schema management.',
		cover: 'https://placehold.co/800x450/2D3748/FFFFFF?text=Prisma+ORM',
		category: 'core',
		tags: ['Database', 'ORM', 'PostgreSQL'],
	},
	{
		uid: 'feature--4',
		title: 'tRPC for Type-Safe APIs',
		description:
			'End-to-end type safety with tRPC, eliminating API contract mismatches and providing excellent developer experience.',
		cover: 'https://placehold.co/800x450/2596BE/FFFFFF?text=tRPC',
		category: 'core',
		tags: ['API', 'Type Safety', 'RPC'],
	},
	{
		uid: 'feature--5',
		title: 'Supabase Integration',
		description:
			'Optional Supabase integration for PostgreSQL database, file storage, realtime subscriptions, and edge functions.',
		cover: 'https://placehold.co/800x450/3ECF8E/FFFFFF?text=Supabase',
		category: 'core',
		tags: ['Database', 'Storage', 'Realtime'],
	},
	// Authentication & Security
	{
		uid: 'feature--6',
		title: 'Better Auth - Multiple Methods',
		description:
			'Comprehensive authentication system with email/password, OAuth (Google, GitHub, Microsoft), magic links, passkeys, OTP, and 2FA.',
		cover: 'https://placehold.co/800x450/FF6B6B/FFFFFF?text=Better+Auth',
		category: 'auth',
		tags: ['Authentication', 'Security', 'OAuth'],
	},
	{
		uid: 'feature--7',
		title: 'Two-Factor Authentication (2FA)',
		description:
			'Time-based one-time password (TOTP) authentication for enhanced security, with QR code setup and backup codes.',
		cover: 'https://placehold.co/800x450/4ECDC4/FFFFFF?text=2FA',
		category: 'auth',
		tags: ['Security', '2FA', 'TOTP'],
	},
	{
		uid: 'feature--8',
		title: 'Passkeys (WebAuthn)',
		description:
			'Passwordless authentication with WebAuthn passkeys, providing secure and convenient login without passwords.',
		cover: 'https://placehold.co/800x450/95E1D3/FFFFFF?text=Passkeys',
		category: 'auth',
		tags: ['Security', 'WebAuthn', 'Passwordless'],
	},
	{
		uid: 'feature--9',
		title: 'Enterprise SSO (SAML/OKTA)',
		description:
			'Enterprise-grade single sign-on support with SAML and OKTA integration for large organizations.',
		cover: 'https://placehold.co/800x450/FFA07A/FFFFFF?text=Enterprise+SSO',
		category: 'auth',
		tags: ['SSO', 'Enterprise', 'SAML'],
	},
	{
		uid: 'feature--10',
		title: 'Session Management',
		description:
			'Advanced session management with device tracking, active session monitoring, and remote logout capabilities.',
		cover: 'https://placehold.co/800x450/FFD93D/FFFFFF?text=Sessions',
		category: 'auth',
		tags: ['Security', 'Sessions', 'Devices'],
	},
	// Workspace & RBAC
	{
		uid: 'feature--11',
		title: 'Multi-Tenant Workspace Management',
		description:
			'Complete workspace management system with multi-tenant architecture, workspace switching, and data isolation.',
		cover: 'https://placehold.co/800x450/6C5CE7/FFFFFF?text=Workspaces',
		category: 'workspace',
		tags: ['Multi-Tenant', 'Workspaces', 'Organizations'],
	},
	{
		uid: 'feature--12',
		title: 'RBAC System (6-30+ Permissions)',
		description:
			'Comprehensive role-based access control with 6-30+ permission levels, including Owner, Admin, Member, and Viewer roles.',
		cover: 'https://placehold.co/800x450/A29BFE/FFFFFF?text=RBAC',
		category: 'workspace',
		tags: ['RBAC', 'Permissions', 'Roles'],
	},
	{
		uid: 'feature--13',
		title: 'Team Member Invitations',
		description:
			'Invite team members via email with role assignment, pending invitation management, and acceptance workflows.',
		cover: 'https://placehold.co/800x450/74B9FF/FFFFFF?text=Invitations',
		category: 'workspace',
		tags: ['Team', 'Invitations', 'Collaboration'],
	},
	{
		uid: 'feature--14',
		title: 'Permission Guards',
		description:
			'Component-level permission guards for fine-grained access control, ensuring users only see what they can access.',
		cover: 'https://placehold.co/800x450/55A3FF/FFFFFF?text=Permissions',
		category: 'workspace',
		tags: ['RBAC', 'Access Control', 'UI'],
	},
	{
		uid: 'feature--15',
		title: 'Workspace Templates (Cloning)',
		description:
			'Clone workspaces with all settings, roles, and permissions. Perfect for replicating workspace structures across teams.',
		cover: 'https://placehold.co/800x450/4F46E5/FFFFFF?text=Cloning',
		category: 'workspace',
		tags: ['Workspaces', 'Templates', 'Productivity'],
	},
	{
		uid: 'feature--16',
		title: 'Workspace Archiving',
		description:
			'Archive and restore workspaces with audit logging. Keeps your workspace list clean while preserving historical data.',
		cover: 'https://placehold.co/800x450/7C3AED/FFFFFF?text=Archiving',
		category: 'workspace',
		tags: ['Workspaces', 'Organization', 'Data Management'],
	},
	{
		uid: 'feature--17',
		title: 'Advanced Permission Management',
		description:
			'Visual permission browser with categories, custom role editor, and granular permission control across all workspace resources.',
		cover: 'https://placehold.co/800x450/8B5CF6/FFFFFF?text=Permissions',
		category: 'workspace',
		tags: ['RBAC', 'Permissions', 'Advanced'],
	},
	{
		uid: 'feature--18',
		title: 'API Key Management',
		description:
			'Secure API key generation with SHA-256 hashing, expiration dates, usage tracking, and one-time display on creation.',
		cover: 'https://placehold.co/800x450/6366F1/FFFFFF?text=API+Keys',
		category: 'workspace',
		tags: ['API', 'Security', 'Integration'],
	},
	{
		uid: 'feature--19',
		title: 'Invitation Links',
		description:
			'Generate shareable invitation links with optional usage limits. Perfect for bulk onboarding and public workspace access.',
		cover: 'https://placehold.co/800x450/818CF8/FFFFFF?text=Invite+Links',
		category: 'workspace',
		tags: ['Invitations', 'Onboarding', 'Collaboration'],
	},
	{
		uid: 'feature--20',
		title: 'Bulk Member Operations',
		description:
			'Invite, update roles, or remove multiple members at once. Supports email lists and provides detailed operation results.',
		cover: 'https://placehold.co/800x450/A5B4FC/FFFFFF?text=Bulk+Operations',
		category: 'workspace',
		tags: ['Team', 'Productivity', 'Management'],
	},
	{
		uid: 'feature--21',
		title: 'User Activity History',
		description:
			'Paginated activity logs showing all user actions, security events, and workspace operations with expandable metadata.',
		cover: 'https://placehold.co/800x450/C7D2FE/FFFFFF?text=Activity+Log',
		category: 'workspace',
		tags: ['Audit', 'History', 'Transparency'],
	},
	{
		uid: 'feature--22',
		title: 'Workspace Usage Metrics',
		description:
			'Comprehensive workspace analytics: member counts, active members (30d), pending invitations, activity rates, and engagement insights.',
		cover: 'https://placehold.co/800x450/DDD6FE/FFFFFF?text=Usage+Metrics',
		category: 'workspace',
		tags: ['Analytics', 'Metrics', 'Insights'],
	},
	// Communication
	{
		uid: 'feature--23',
		title: 'Email Infrastructure with Resend',
		description:
			'Complete email system with Resend integration, React Email templates, and automatic email sending for all auth flows.',
		cover: 'https://placehold.co/800x450/FF6B9D/FFFFFF?text=Email',
		category: 'communication',
		tags: ['Email', 'Resend', 'Templates'],
	},
	{
		uid: 'feature--24',
		title: 'React Email Templates',
		description:
			'Six beautiful email templates: welcome, verification, password-reset, magic-link, invitation, and 2FA codes.',
		cover: 'https://placehold.co/800x450/FF8E9B/FFFFFF?text=Email+Templates',
		category: 'communication',
		tags: ['Email', 'Templates', 'React Email'],
	},
	{
		uid: 'feature--25',
		title: 'In-App Notifications',
		description:
			'Real-time in-app notifications with polling support and Supabase-ready architecture for live updates.',
		cover: 'https://placehold.co/800x450/FFB3BA/FFFFFF?text=Notifications',
		category: 'communication',
		tags: ['Notifications', 'Realtime', 'UI'],
	},
	{
		uid: 'feature--26',
		title: 'Notification Preferences',
		description:
			'Granular notification preferences with 7 categories and email/in-app toggles for each notification type.',
		cover: 'https://placehold.co/800x450/FFC1C8/FFFFFF?text=Preferences',
		category: 'communication',
		tags: ['Notifications', 'Settings', 'User Control'],
	},
	// Storage & Files
	{
		uid: 'feature--27',
		title: 'File Upload & Storage',
		description:
			'Supabase Storage integration for file uploads with image optimization, file type validation, and size limits.',
		cover: 'https://placehold.co/800x450/00D9FF/FFFFFF?text=File+Storage',
		category: 'storage',
		tags: ['Storage', 'Uploads', 'Files'],
	},
	{
		uid: 'feature--28',
		title: 'Image Upload with Preview',
		description:
			'Image upload component with real-time preview, cropping support, and automatic optimization for avatars and media.',
		cover: 'https://placehold.co/800x450/00C9FF/FFFFFF?text=Image+Upload',
		category: 'storage',
		tags: ['Images', 'Upload', 'Preview'],
	},
	// Analytics & Admin
	{
		uid: 'feature--29',
		title: 'Analytics Dashboard',
		description:
			'Comprehensive analytics dashboard with user growth charts (Recharts), activity metrics, and customizable time ranges.',
		cover: 'https://placehold.co/800x450/00B8FF/FFFFFF?text=Analytics',
		category: 'analytics',
		tags: ['Analytics', 'Charts', 'Metrics'],
	},
	{
		uid: 'feature--30',
		title: 'Admin Dashboard',
		description:
			'Full-featured admin dashboard with user management, system statistics, audit logs, and environment-based access control.',
		cover: 'https://placehold.co/800x450/0099FF/FFFFFF?text=Admin',
		category: 'analytics',
		tags: ['Admin', 'Management', 'Dashboard'],
	},
	{
		uid: 'feature--31',
		title: 'User Impersonation',
		description:
			'Secure user impersonation for support purposes with 1-hour session expiry, audit logging, and visual indicators.',
		cover: 'https://placehold.co/800x450/0088FF/FFFFFF?text=Impersonation',
		category: 'analytics',
		tags: ['Admin', 'Support', 'Security'],
	},
	{
		uid: 'feature--32',
		title: 'Audit Logs',
		description:
			'Complete audit trail with filtering, CSV export, user tracking, IP addresses, and comprehensive action logging.',
		cover: 'https://placehold.co/800x450/0077FF/FFFFFF?text=Audit+Logs',
		category: 'analytics',
		tags: ['Audit', 'Logging', 'Compliance'],
	},
	// UI & Developer Experience
	{
		uid: 'feature--33',
		title: 'ShadCN UI (50+ Components)',
		description:
			'Comprehensive UI component library with 50+ accessible components built on Radix UI primitives.',
		cover: 'https://placehold.co/800x450/000000/FFFFFF?text=ShadCN+UI',
		category: 'ui',
		tags: ['UI', 'Components', 'Accessibility'],
	},
	{
		uid: 'feature--34',
		title: 'Tailwind CSS 4',
		description:
			'Modern utility-first CSS framework with Tailwind CSS 4 for rapid UI development and consistent design.',
		cover: 'https://placehold.co/800x450/38BDF8/FFFFFF?text=Tailwind+CSS',
		category: 'ui',
		tags: ['Styling', 'CSS', 'Design System'],
	},
	{
		uid: 'feature--35',
		title: 'Motion Primitives (10 Components)',
		description:
			'Ten custom animation components including magnetic effects, text morphing, spotlight, and progressive blur.',
		cover: 'https://placehold.co/800x450/FF0055/FFFFFF?text=Motion',
		category: 'ui',
		tags: ['Animations', 'Motion', 'UX'],
	},
	{
		uid: 'feature--36',
		title: 'Dark/Light Mode',
		description:
			'System-aware dark and light mode with next-themes, CSS variables, and seamless theme switching.',
		cover: 'https://placehold.co/800x450/6366F1/FFFFFF?text=Themes',
		category: 'ui',
		tags: ['Theming', 'Dark Mode', 'UX'],
	},
	{
		uid: 'feature--37',
		title: 'Internationalization (i18n)',
		description:
			'Full internationalization support with next-intl, locale detection, and translation management for global apps.',
		cover: 'https://placehold.co/800x450/8B5CF6/FFFFFF?text=i18n',
		category: 'ui',
		tags: ['i18n', 'Localization', 'Translations'],
	},
	{
		uid: 'feature--38',
		title: 'Settings Pages (5 Complete)',
		description:
			'Five comprehensive settings pages: Profile, Account, Security, Team, and Notifications with full functionality.',
		cover: 'https://placehold.co/800x450/EC4899/FFFFFF?text=Settings',
		category: 'ui',
		tags: ['Settings', 'User Management', 'UI'],
	},
	// Production Ready
	{
		uid: 'feature--39',
		title: 'Error Boundaries',
		description:
			'Multi-level error boundaries (global, root, dashboard, admin) with user-friendly messages and recovery actions.',
		cover: 'https://placehold.co/800x450/EF4444/FFFFFF?text=Error+Handling',
		category: 'production',
		tags: ['Error Handling', 'Resilience', 'UX'],
	},
	{
		uid: 'feature--40',
		title: 'Loading States & Skeletons',
		description:
			'Comprehensive loading states with React Suspense, loading skeletons, and progressive content loading.',
		cover: 'https://placehold.co/800x450/F59E0B/FFFFFF?text=Loading',
		category: 'production',
		tags: ['Loading', 'Suspense', 'UX'],
	},
	{
		uid: 'feature--41',
		title: 'Rate Limiting (3 Tiers)',
		description:
			'Three-tier rate limiting system: default (100/15min), strict (10/15min), and auth (5/15min) with IP tracking.',
		cover: 'https://placehold.co/800x450/10B981/FFFFFF?text=Rate+Limiting',
		category: 'production',
		tags: ['Security', 'Rate Limiting', 'Performance'],
	},
	{
		uid: 'feature--42',
		title: 'Security Headers',
		description:
			'Comprehensive security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and more for production.',
		cover: 'https://placehold.co/800x450/059669/FFFFFF?text=Security',
		category: 'production',
		tags: ['Security', 'Headers', 'Production'],
	},
	{
		uid: 'feature--43',
		title: 'Code Quality Tools',
		description:
			'Biome for formatting and import organization, Oxlint for fast linting, and Husky for pre-commit hooks.',
		cover: 'https://placehold.co/800x450/7C3AED/FFFFFF?text=Code+Quality',
		category: 'production',
		tags: ['Linting', 'Formatting', 'Developer Experience'],
	},
]

export type Category =
	| 'all'
	| 'core'
	| 'auth'
	| 'workspace'
	| 'communication'
	| 'storage'
	| 'analytics'
	| 'ui'
	| 'production'

export const CATEGORY_MAP: Record<Category, string> = {
	all: 'All Features',
	core: 'Core Infrastructure',
	auth: 'Authentication & Security',
	workspace: 'Workspace & RBAC',
	communication: 'Communication',
	storage: 'Storage & Files',
	analytics: 'Analytics & Admin',
	ui: 'UI & Developer Experience',
	production: 'Production Ready',
}
