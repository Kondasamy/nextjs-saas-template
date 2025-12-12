import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import { PrismaClient } from './generated/prisma/client'

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

// Demo credentials - visible to users
const DEMO_ADMIN = {
	email: 'demo@yourdomain.com',
	password: 'demo1234',
	name: 'Demo Admin',
}

const DEMO_USERS = [
	{ email: 'john@example.com', name: 'John Smith' },
	{ email: 'sarah@example.com', name: 'Sarah Johnson' },
	{ email: 'mike@example.com', name: 'Mike Wilson' },
	{ email: 'emily@example.com', name: 'Emily Davis' },
	{ email: 'alex@example.com', name: 'Alex Brown' },
	{ email: 'lisa@example.com', name: 'Lisa Anderson' },
	{ email: 'david@example.com', name: 'David Martinez' },
	{ email: 'emma@example.com', name: 'Emma Taylor' },
	{ email: 'chris@example.com', name: 'Chris Lee' },
	{ email: 'anna@example.com', name: 'Anna White' },
]

async function main() {
	console.log('Seeding database...')

	// Clean up existing demo data
	console.log('Cleaning up existing data...')
	await prisma.auditLog.deleteMany({})
	await prisma.notification.deleteMany({})
	await prisma.invitation.deleteMany({})
	await prisma.aPIKey.deleteMany({})
	await prisma.organizationMember.deleteMany({})
	await prisma.role.deleteMany({})
	await prisma.organization.deleteMany({})
	await prisma.twoFactorAuth.deleteMany({})
	await prisma.passkey.deleteMany({})
	await prisma.session.deleteMany({})
	await prisma.account.deleteMany({})
	await prisma.verification.deleteMany({})
	await prisma.user.deleteMany({})

	// Create system settings
	console.log('Creating system settings...')
	await prisma.systemSettings.upsert({
		where: { id: 'system' },
		update: {},
		create: {
			id: 'system',
			theme: 'default',
			maintenanceMode: false,
		},
	})

	// Create demo admin user
	console.log('Creating demo admin user...')
	const hashedPassword = await bcrypt.hash(DEMO_ADMIN.password, 10)

	const adminUser = await prisma.user.create({
		data: {
			email: DEMO_ADMIN.email,
			name: DEMO_ADMIN.name,
			emailVerified: true,
			isAdmin: true,
			image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${DEMO_ADMIN.email}`,
			bio: 'Demo administrator account for exploring the SaaS template features.',
			timezone: 'UTC',
			language: 'en',
		},
	})

	// Create account for email/password login
	await prisma.account.create({
		data: {
			userId: adminUser.id,
			accountId: adminUser.id,
			providerId: 'credential',
			password: hashedPassword,
		},
	})

	// Create demo users
	console.log('Creating demo users...')
	const users = []
	for (const userData of DEMO_USERS) {
		const user = await prisma.user.create({
			data: {
				email: userData.email,
				name: userData.name,
				emailVerified: true,
				isAdmin: false,
				image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
				bio: `${userData.name} is a demo user for testing purposes.`,
				timezone: 'UTC',
				language: 'en',
			},
		})
		users.push(user)

		// Create account for each user
		const userHashedPassword = await bcrypt.hash('password123', 10)
		await prisma.account.create({
			data: {
				userId: user.id,
				accountId: user.id,
				providerId: 'credential',
				password: userHashedPassword,
			},
		})
	}

	// Create demo workspace for admin
	console.log('Creating demo workspace...')
	const workspace = await prisma.organization.create({
		data: {
			name: 'Demo Workspace',
			slug: 'demo-workspace',
			description:
				'A demo workspace to explore all the features of this SaaS template.',
			logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=demo-workspace',
		},
	})

	// Create roles
	console.log('Creating roles...')
	const ownerRole = await prisma.role.create({
		data: {
			organizationId: workspace.id,
			name: 'Owner',
			description: 'Full access to all workspace features',
			permissions: ['*'],
			isSystem: true,
		},
	})

	const adminRole = await prisma.role.create({
		data: {
			organizationId: workspace.id,
			name: 'Admin',
			description: 'Administrative access with most permissions',
			permissions: [
				'workspace:read',
				'workspace:update',
				'members:read',
				'members:invite',
				'members:remove',
				'roles:read',
				'roles:create',
				'roles:update',
				'analytics:read',
				'api-keys:read',
				'api-keys:create',
				'api-keys:delete',
			],
			isSystem: true,
		},
	})

	const memberRole = await prisma.role.create({
		data: {
			organizationId: workspace.id,
			name: 'Member',
			description: 'Standard member access',
			permissions: ['workspace:read', 'members:read', 'analytics:read'],
			isSystem: true,
		},
	})

	const viewerRole = await prisma.role.create({
		data: {
			organizationId: workspace.id,
			name: 'Viewer',
			description: 'Read-only access',
			permissions: ['workspace:read'],
			isSystem: true,
		},
	})

	// Add admin as owner of workspace
	await prisma.organizationMember.create({
		data: {
			organizationId: workspace.id,
			userId: adminUser.id,
			roleId: ownerRole.id,
		},
	})

	// Add some users to workspace with different roles
	const roleAssignments = [
		{ user: users[0], role: adminRole },
		{ user: users[1], role: adminRole },
		{ user: users[2], role: memberRole },
		{ user: users[3], role: memberRole },
		{ user: users[4], role: memberRole },
		{ user: users[5], role: viewerRole },
		{ user: users[6], role: viewerRole },
	]

	for (const assignment of roleAssignments) {
		await prisma.organizationMember.create({
			data: {
				organizationId: workspace.id,
				userId: assignment.user.id,
				roleId: assignment.role.id,
			},
		})
	}

	// Create a second workspace
	console.log('Creating second workspace...')
	const workspace2 = await prisma.organization.create({
		data: {
			name: 'Acme Corp',
			slug: 'acme-corp',
			description: 'Another demo workspace to show multi-tenancy.',
			logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=acme-corp',
		},
	})

	const ownerRole2 = await prisma.role.create({
		data: {
			organizationId: workspace2.id,
			name: 'Owner',
			description: 'Full access to all workspace features',
			permissions: ['*'],
			isSystem: true,
		},
	})

	await prisma.organizationMember.create({
		data: {
			organizationId: workspace2.id,
			userId: adminUser.id,
			roleId: ownerRole2.id,
		},
	})

	// Create pending invitations
	console.log('Creating invitations...')
	await prisma.invitation.create({
		data: {
			organizationId: workspace.id,
			email: 'pending1@example.com',
			invitedById: adminUser.id,
			roleId: memberRole.id,
			token: `invite_${Date.now()}_1`,
			type: 'email',
			status: 'pending',
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		},
	})

	await prisma.invitation.create({
		data: {
			organizationId: workspace.id,
			email: 'pending2@example.com',
			invitedById: adminUser.id,
			roleId: viewerRole.id,
			token: `invite_${Date.now()}_2`,
			type: 'email',
			status: 'pending',
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		},
	})

	// Create shareable invite link
	await prisma.invitation.create({
		data: {
			organizationId: workspace.id,
			invitedById: adminUser.id,
			roleId: memberRole.id,
			token: `link_${Date.now()}_1`,
			type: 'link',
			maxUses: 10,
			usedCount: 3,
			status: 'pending',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
	})

	// Create notifications for admin
	console.log('Creating notifications...')
	const notificationTypes = [
		{
			title: 'Welcome to the Demo!',
			message:
				'Explore all the features of this SaaS template. Check out the admin panel, workspace settings, and more.',
			type: 'info',
		},
		{
			title: 'New Team Member',
			message: 'John Smith has joined the Demo Workspace.',
			type: 'success',
		},
		{
			title: 'Security Alert',
			message:
				'A new device was used to sign in to your account. If this was you, no action is needed.',
			type: 'warning',
		},
		{
			title: 'Weekly Report Ready',
			message:
				'Your weekly analytics report is ready. View it in the dashboard.',
			type: 'info',
		},
		{
			title: 'Invitation Accepted',
			message: 'Sarah Johnson accepted your invitation to join Demo Workspace.',
			type: 'success',
		},
	]

	for (let i = 0; i < notificationTypes.length; i++) {
		const notif = notificationTypes[i]
		await prisma.notification.create({
			data: {
				userId: adminUser.id,
				title: notif.title,
				message: notif.message,
				type: notif.type,
				read: i > 2, // First 3 are unread
				createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
			},
		})
	}

	// Create audit logs
	console.log('Creating audit logs...')
	const auditActions = [
		{ action: 'user.login', resource: 'auth', userId: adminUser.id },
		{
			action: 'workspace.create',
			resource: 'organization',
			userId: adminUser.id,
		},
		{ action: 'member.invite', resource: 'invitation', userId: adminUser.id },
		{ action: 'member.join', resource: 'member', userId: users[0].id },
		{ action: 'role.update', resource: 'role', userId: adminUser.id },
		{ action: 'settings.update', resource: 'settings', userId: adminUser.id },
		{ action: 'user.login', resource: 'auth', userId: users[1].id },
		{ action: 'member.invite', resource: 'invitation', userId: adminUser.id },
		{ action: 'api-key.create', resource: 'api-key', userId: adminUser.id },
		{ action: 'user.login', resource: 'auth', userId: users[2].id },
		{
			action: 'workspace.update',
			resource: 'organization',
			userId: adminUser.id,
		},
		{ action: 'member.join', resource: 'member', userId: users[3].id },
		{ action: 'user.login', resource: 'auth', userId: adminUser.id },
		{ action: 'theme.change', resource: 'settings', userId: adminUser.id },
		{ action: 'user.login', resource: 'auth', userId: users[4].id },
	]

	// Create audit logs spread over the last 30 days
	for (let i = 0; i < 50; i++) {
		const action = auditActions[i % auditActions.length]
		const daysAgo = Math.floor(Math.random() * 30)
		const hoursAgo = Math.floor(Math.random() * 24)

		await prisma.auditLog.create({
			data: {
				userId: action.userId,
				organizationId: workspace.id,
				action: action.action,
				resource: action.resource,
				resourceId: `resource_${i}`,
				metadata: {
					ip: '192.168.1.' + Math.floor(Math.random() * 255),
					userAgent: 'Mozilla/5.0 (Demo Browser)',
				},
				ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
				userAgent: 'Mozilla/5.0 (Demo Browser)',
				createdAt: new Date(
					Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000
				),
			},
		})
	}

	// Create API keys
	console.log('Creating API keys...')
	const crypto = await import('crypto')

	for (let i = 1; i <= 3; i++) {
		const key = `sk_demo_${crypto.randomBytes(16).toString('hex')}`
		const hashedKey = crypto.createHash('sha256').update(key).digest('hex')

		await prisma.aPIKey.create({
			data: {
				organizationId: workspace.id,
				name: `Demo API Key ${i}`,
				key: key.slice(0, 12) + '...',
				hashedKey,
				createdById: adminUser.id,
				lastUsedAt: i === 1 ? new Date() : null,
				expiresAt:
					i === 3 ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : null,
			},
		})
	}

	console.log('')
	console.log('='.repeat(50))
	console.log('Database seeded successfully!')
	console.log('='.repeat(50))
	console.log('')
	console.log('Demo Admin Credentials:')
	console.log(`  Email:    ${DEMO_ADMIN.email}`)
	console.log(`  Password: ${DEMO_ADMIN.password}`)
	console.log('')
	console.log('Features to explore:')
	console.log('  - Admin Dashboard (/admin)')
	console.log('  - User Management (/admin/users)')
	console.log('  - Audit Logs (/admin/audit)')
	console.log('  - Theme Management (/admin/themes)')
	console.log('  - Workspace Settings (/workspace/settings)')
	console.log('  - Role Management (/workspace/roles)')
	console.log('  - API Keys (/workspace/api-keys)')
	console.log('='.repeat(50))
}

main()
	.catch((e) => {
		console.error('Error seeding database:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
