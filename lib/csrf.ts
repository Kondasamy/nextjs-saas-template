import { randomBytes } from 'crypto'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { env } from './env'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const JWT_SECRET = new TextEncoder().encode(env.BETTER_AUTH_SECRET)

interface CSRFTokenPayload {
	value: string
	sessionId?: string
}

/**
 * Generate a new CSRF token
 */
export async function generateCSRFToken(sessionId?: string): Promise<string> {
	const tokenValue = randomBytes(32).toString('hex')

	const payload: CSRFTokenPayload = {
		value: tokenValue,
		sessionId,
	}

	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('24h')
		.sign(JWT_SECRET)

	return token
}

/**
 * Set CSRF token in cookie
 */
export async function setCSRFToken(sessionId?: string): Promise<string> {
	const token = await generateCSRFToken(sessionId)
	const cookieStore = await cookies()

	cookieStore.set(CSRF_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24, // 24 hours
		path: '/',
	})

	return token
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFTokenFromCookie(): Promise<string | null> {
	const cookieStore = await cookies()
	const cookie = cookieStore.get(CSRF_COOKIE_NAME)
	return cookie?.value || null
}

/**
 * Verify CSRF token
 */
export async function verifyCSRFToken(
	headerToken: string | null,
	cookieToken: string | null,
	sessionId?: string
): Promise<boolean> {
	// Both tokens must be present
	if (!headerToken || !cookieToken) {
		return false
	}

	// Tokens must match
	if (headerToken !== cookieToken) {
		return false
	}

	try {
		// Verify JWT signature and expiration
		const { payload } = await jwtVerify(cookieToken, JWT_SECRET)
		const tokenPayload = payload as unknown as CSRFTokenPayload

		// If sessionId is provided, verify it matches
		if (sessionId && tokenPayload.sessionId !== sessionId) {
			return false
		}

		return true
	} catch {
		return false
	}
}

/**
 * CSRF middleware for API routes
 */
export async function validateCSRF(request: Request): Promise<boolean> {
	// Skip CSRF for safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
		return true
	}

	const headerToken = request.headers.get(CSRF_HEADER_NAME)
	const cookieToken = await getCSRFTokenFromCookie()

	return verifyCSRFToken(headerToken, cookieToken)
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFTokenForClient(): Promise<string> {
	const existingToken = await getCSRFTokenFromCookie()

	if (existingToken) {
		try {
			// Verify token is still valid
			await jwtVerify(existingToken, JWT_SECRET)
			return existingToken
		} catch {
			// Token invalid or expired, generate new one
		}
	}

	// Generate new token
	return setCSRFToken()
}
