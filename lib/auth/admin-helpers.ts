import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from './auth-helpers'

/**
 * Check if user is a super admin
 * Uses database isAdmin field with fallback to environment variable for initial setup
 */
export async function requireAdmin() {
	const session = await getAuthSession()
	const user = session?.user

	if (!user) {
		redirect('/login')
	}

	// Check database for admin status
	const dbUser = await prisma.user.findUnique({
		where: { email: user.email },
		select: { isAdmin: true, banned: true },
	})

	// Check if user is banned
	if (dbUser?.banned) {
		logger.security('Banned user attempted admin access', { email: user.email })
		redirect('/login')
	}

	// Check if user is admin in database
	let isAdmin = dbUser?.isAdmin || false

	// Fallback to environment variable for initial admin setup
	// This allows setting up the first admin user
	if (!isAdmin) {
		const adminEmails =
			process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []

		if (adminEmails.includes(user.email)) {
			// Auto-promote user to admin if they're in the env variable
			// This helps with initial setup
			try {
				await prisma.user.update({
					where: { email: user.email },
					data: { isAdmin: true },
				})
				logger.security('Auto-promoted user to admin', { email: user.email })
				isAdmin = true
			} catch (error) {
				logger.error('Failed to auto-promote user', error)
			}
		}
	}

	if (!isAdmin) {
		// Log access denial
		logger.security('Admin access denied', {
			email: user.email,
			dbAdmin: dbUser?.isAdmin || false,
			hint:
				process.env.NODE_ENV === 'development'
					? 'Add your email to ADMIN_EMAILS in .env.local for initial setup'
					: undefined,
		})
		redirect('/')
	}

	return user
}

export async function isUserAdmin(email: string): Promise<boolean> {
	// Check database first
	const user = await prisma.user.findUnique({
		where: { email },
		select: { isAdmin: true, banned: true },
	})

	// Banned users are never admins
	if (user?.banned) {
		return false
	}

	// Return database admin status
	if (user?.isAdmin) {
		return true
	}

	// Fallback to environment variable for initial setup
	const adminEmails =
		process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []
	return adminEmails.includes(email)
}
