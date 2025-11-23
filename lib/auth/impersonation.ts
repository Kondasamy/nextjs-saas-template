import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

const IMPERSONATION_COOKIE = 'impersonation_session'
const JWT_SECRET = new TextEncoder().encode(env.BETTER_AUTH_SECRET)

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

	// Create signed JWT token
	const token = await new SignJWT({ ...session })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(JWT_SECRET)

	// Store in cookie
	const cookieStore = await cookies()
	cookieStore.set(IMPERSONATION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict', // Stricter for admin functionality
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

	try {
		const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
		const session = payload as ImpersonationSession

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
	} catch {
		// Invalid token, clear cookie
		cookieStore.delete(IMPERSONATION_COOKIE)
		return null
	}
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
		const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET, {
			maxTokenAge: '1h',
		})
		const session = payload as ImpersonationSession

		// JWT handles expiration, but double-check for safety
		if (Date.now() - session.startedAt > 60 * 60 * 1000) {
			await stopImpersonation()
			return null
		}

		return session
	} catch {
		// Invalid or expired token
		await stopImpersonation()
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
