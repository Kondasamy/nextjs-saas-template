import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const IMPERSONATION_COOKIE = 'impersonation_session'

interface ImpersonationSession {
	adminId: string
	userId: string
	startedAt: number
}

/**
 * Start impersonating a user (admin only)
 */
export async function startImpersonation(
	adminId: string,
	userId: string
): Promise<void> {
	// Verify admin exists
	const admin = await prisma.user.findUnique({
		where: { id: adminId },
	})

	if (!admin) {
		throw new Error('Admin user not found')
	}

	// Verify target user exists
	const targetUser = await prisma.user.findUnique({
		where: { id: userId },
	})

	if (!targetUser) {
		throw new Error('Target user not found')
	}

	// Create impersonation session
	const session: ImpersonationSession = {
		adminId,
		userId,
		startedAt: Date.now(),
	}

	// Store in cookie
	const cookieStore = await cookies()
	cookieStore.set(IMPERSONATION_COOKIE, JSON.stringify(session), {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60, // 1 hour
	})

	// Log impersonation start in audit log
	await prisma.auditLog.create({
		data: {
			action: 'IMPERSONATION_START',
			userId: adminId,
			details: {
				targetUserId: userId,
				targetUserEmail: targetUser.email,
			},
			ipAddress: 'system',
			userAgent: 'impersonation',
		},
	})
}

/**
 * Stop impersonating and return to admin session
 */
export async function stopImpersonation(): Promise<string | null> {
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get(IMPERSONATION_COOKIE)

	if (!sessionCookie) {
		return null
	}

	const session: ImpersonationSession = JSON.parse(sessionCookie.value)

	// Log impersonation end in audit log
	await prisma.auditLog.create({
		data: {
			action: 'IMPERSONATION_END',
			userId: session.adminId,
			details: {
				targetUserId: session.userId,
				duration: Date.now() - session.startedAt,
			},
			ipAddress: 'system',
			userAgent: 'impersonation',
		},
	})

	// Clear cookie
	cookieStore.delete(IMPERSONATION_COOKIE)

	return session.adminId
}

/**
 * Get current impersonation session if active
 */
export async function getImpersonationSession(): Promise<ImpersonationSession | null> {
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get(IMPERSONATION_COOKIE)

	if (!sessionCookie) {
		return null
	}

	try {
		const session: ImpersonationSession = JSON.parse(sessionCookie.value)

		// Check if session expired (1 hour)
		if (Date.now() - session.startedAt > 60 * 60 * 1000) {
			await stopImpersonation()
			return null
		}

		return session
	} catch {
		return null
	}
}

/**
 * Check if currently impersonating
 */
export async function isImpersonating(): Promise<boolean> {
	const session = await getImpersonationSession()
	return session !== null
}

/**
 * Get the actual user ID (considering impersonation)
 */
export async function getEffectiveUserId(
	sessionUserId: string
): Promise<string> {
	const impersonation = await getImpersonationSession()
	return impersonation?.userId || sessionUserId
}
