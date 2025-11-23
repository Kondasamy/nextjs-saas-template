import { headers } from 'next/headers'
import { logger } from '@/lib/logger'

/**
 * Rate Limiting Module
 *
 * Currently uses in-memory storage with protection against memory leaks.
 * For production deployments, migrate to Redis:
 *
 * @example Redis Implementation
 * ```typescript
 * import { Redis } from 'ioredis'
 * const redis = new Redis(process.env.REDIS_URL)
 *
 * // In check() method:
 * const count = await redis.incr(key)
 * if (count === 1) {
 *   await redis.expire(key, Math.floor(this.windowMs / 1000))
 * }
 * ```
 */

interface RateLimitOptions {
	windowMs: number // Time window in milliseconds
	max: number // Max requests per window
	keyPrefix?: string // Optional prefix for storage keys
}

interface RateLimitEntry {
	count: number
	resetTime: number
	lastAccess: number
}

interface RateLimitStore {
	[key: string]: RateLimitEntry
}

// Configuration
const MAX_STORE_SIZE = 5000 // Reduced maximum entries for better memory management
const CLEANUP_INTERVAL = 30 * 1000 // Clean up every 30 seconds for aggressive cleanup
const EMERGENCY_CLEANUP_THRESHOLD = 0.75 // Trigger emergency cleanup at 75% capacity

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {}

// Track store size for monitoring
let cleanupRunning = false

// More aggressive cleanup to prevent memory leaks
if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		if (cleanupRunning) return // Prevent overlapping cleanups
		cleanupRunning = true

		try {
			const now = Date.now()
			const entries = Object.entries(store)

			// Remove expired entries
			let removed = 0
			for (const [key, entry] of entries) {
				if (entry.resetTime < now) {
					delete store[key]
					removed++
				}
			}

			// If store is still too large, remove oldest entries
			const currentSize = Object.keys(store).length
			if (currentSize > MAX_STORE_SIZE) {
				const sortedEntries = Object.entries(store).sort(
					(a, b) => a[1].lastAccess - b[1].lastAccess
				)

				const toRemove = currentSize - MAX_STORE_SIZE + 1000 // Remove extra 1000 for buffer
				for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
					delete store[sortedEntries[i][0]]
					removed++
				}
			}

			// Log cleanup stats in development
			if (removed > 0) {
				logger.debug('Rate limiter cleanup completed', {
					removed,
					currentSize: Object.keys(store).length,
				})
			}
		} finally {
			cleanupRunning = false
		}
	}, CLEANUP_INTERVAL)
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

		// Early check for store size to prevent memory attacks
		const storeSize = Object.keys(store).length

		// If we're at capacity, reject new IPs to prevent memory exhaustion
		if (storeSize >= MAX_STORE_SIZE && !store[key]) {
			// Log potential attack
			logger.warn('Rate limiter store at capacity, rejecting new identifier', {
				storeSize,
				identifier,
			})
			return {
				success: false,
				limit: this.max,
				remaining: 0,
				reset: now + this.windowMs,
			}
		}

		// Emergency cleanup if over threshold
		if (storeSize > MAX_STORE_SIZE * EMERGENCY_CLEANUP_THRESHOLD) {
			// Remove expired entries first
			const expired = Object.entries(store)
				.filter(([_, entry]) => entry.resetTime < now)
				.map(([k]) => k)

			for (const k of expired) {
				delete store[k]
			}

			// If still too large, remove oldest entries
			const currentSize = Object.keys(store).length
			if (currentSize > MAX_STORE_SIZE * EMERGENCY_CLEANUP_THRESHOLD) {
				const toRemove = currentSize - Math.floor(MAX_STORE_SIZE * 0.5) // Remove down to 50%
				const sorted = Object.entries(store)
					.sort((a, b) => a[1].lastAccess - b[1].lastAccess)
					.slice(0, toRemove)

				for (const [k] of sorted) {
					delete store[k]
				}
			}
		}

		// Get or create rate limit entry
		let entry = store[key]

		// Reset if window has passed
		if (!entry || entry.resetTime < now) {
			entry = {
				count: 0,
				resetTime: now + this.windowMs,
				lastAccess: now,
			}
			store[key] = entry
		}

		// Update last access time
		entry.lastAccess = now

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

// Removed unused getRateLimitHeaders export
// If needed in future, rate limit headers can be added in the response middleware
