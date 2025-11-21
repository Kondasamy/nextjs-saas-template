import { redirect } from 'next/navigation'
import { getAuthSession } from './auth-helpers'

/**
 * Check if user is a super admin
 * For now, checking if user email matches admin email from env
 * In production, you might want a dedicated admin role in the database
 */
export async function requireAdmin() {
	const session = await getAuthSession()
	const user = session?.user

	if (!user) {
		redirect('/login')
	}

	// Check if user is admin (you can customize this logic)
	const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []
	const isAdmin = adminEmails.includes(user.email)

	if (!isAdmin) {
		// Log helpful debug info in development
		if (process.env.NODE_ENV === 'development') {
			console.log('[Admin Access] Access denied:', {
				userEmail: user.email,
				adminEmails: adminEmails.length > 0 ? adminEmails : '(not configured)',
				hint: 'Add your email to ADMIN_EMAILS in .env.local',
			})
		}
		redirect('/')
	}

	return user
}

export async function isUserAdmin(email: string): Promise<boolean> {
	const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []
	return adminEmails.includes(email)
}
