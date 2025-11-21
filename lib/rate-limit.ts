import { headers } from 'next/headers'

interface RateLimitOptions {
	windowMs: number // Time window in milliseconds
	max: number // Max requests per window
	keyPrefix?: string // Optional prefix for storage keys
}

interface RateLimitStore {
	[key: string]: {
		count: number
		resetTime: number
	}
}

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
	setInterval(
		() => {
			const now = Date.now()
			for (const key in store) {
				if (store[key].resetTime < now) {
					delete store[key]
				}
			}
		},
		5 * 60 * 1000
	)
}

export class RateLimiter {
	private windowMs: number
	private max: number
	private keyPrefix: string

	constructor(options: RateLimitOptions) {
		this.windowMs = options.windowMs
		this.max = options.max
		this.keyPrefix = options.keyPrefix || 'ratelimit'
	}

	async check(identifier: string): Promise<{
		success: boolean
		limit: number
		remaining: number
		reset: number
	}> {
		const now = Date.now()
		const key = `${this.keyPrefix}:${identifier}`

		// Get or create rate limit entry
		let entry = store[key]

		// Reset if window has passed
		if (!entry || entry.resetTime < now) {
			entry = {
				count: 0,
				resetTime: now + this.windowMs,
			}
			store[key] = entry
		}

		// Increment counter
		entry.count++

		const remaining = Math.max(0, this.max - entry.count)
		const success = entry.count <= this.max

		return {
			success,
			limit: this.max,
			remaining,
			reset: entry.resetTime,
		}
	}
}

// Default rate limiter for API routes (100 requests per 15 minutes)
export const defaultRateLimiter = new RateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
})

// Strict rate limiter for sensitive operations (10 requests per 15 minutes)
export const strictRateLimiter = new RateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10,
	keyPrefix: 'ratelimit:strict',
})

// Auth rate limiter (5 attempts per 15 minutes)
export const authRateLimiter = new RateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5,
	keyPrefix: 'ratelimit:auth',
})

/**
 * Get client IP address from headers
 */
export async function getClientIp(): Promise<string> {
	const headersList = await headers()
	const forwarded = headersList.get('x-forwarded-for')
	const realIp = headersList.get('x-real-ip')

	if (forwarded) {
		return forwarded.split(',')[0].trim()
	}

	if (realIp) {
		return realIp
	}

	// Fallback to a default identifier
	return 'unknown'
}

/**
 * Middleware to check rate limit and throw error if exceeded
 */
export async function checkRateLimit(
	limiter: RateLimiter = defaultRateLimiter,
	identifier?: string
): Promise<void> {
	const ip = identifier || (await getClientIp())
	const result = await limiter.check(ip)

	if (!result.success) {
		const error = new Error('Too many requests. Please try again later.')
		;(error as any).statusCode = 429
		;(error as any).remaining = result.remaining
		;(error as any).reset = result.reset
		throw error
	}
}

/**
 * Helper to get rate limit headers for response
 */
export function getRateLimitHeaders(result: {
	limit: number
	remaining: number
	reset: number
}) {
	return {
		'X-RateLimit-Limit': result.limit.toString(),
		'X-RateLimit-Remaining': result.remaining.toString(),
		'X-RateLimit-Reset': new Date(result.reset).toISOString(),
	}
}
