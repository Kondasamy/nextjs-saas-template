/**
 * Logger utility with sensitive data sanitization
 */

// List of sensitive field names to sanitize
const SENSITIVE_FIELDS = [
	'password',
	'token',
	'secret',
	'apiKey',
	'api_key',
	'authorization',
	'cookie',
	'session',
	'creditCard',
	'credit_card',
	'ssn',
	'email', // Partially mask emails in production
	'phone',
	'otp',
	'code',
	'verificationCode',
	'resetToken',
	'refreshToken',
	'accessToken',
	'privateKey',
	'private_key',
	'clientSecret',
	'client_secret',
]

/**
 * Mask sensitive string values
 */
function maskSensitiveValue(value: string, field?: string): string {
	if (field === 'email') {
		// Partially mask email: jo**@ex*****.com
		const [localPart, domain] = value.split('@')
		if (!domain) return '***'
		const maskedLocal = localPart.substring(0, 2) + '**'
		const [domainName, tld] = domain.split('.')
		const maskedDomain = domainName.substring(0, 2) + '*****'
		return `${maskedLocal}@${maskedDomain}.${tld || 'com'}`
	}
	// For other sensitive fields, show only first and last character
	if (value.length <= 4) return '***'
	return value.charAt(0) + '***' + value.charAt(value.length - 1)
}

/**
 * Recursively sanitize an object by masking sensitive fields
 */
function sanitizeObject(obj: any, depth = 0): any {
	// Prevent infinite recursion
	if (depth > 10) return '[Max depth exceeded]'

	if (obj === null || obj === undefined) {
		return obj
	}

	if (typeof obj === 'string') {
		return obj
	}

	if (typeof obj === 'object') {
		if (Array.isArray(obj)) {
			return obj.map((item) => sanitizeObject(item, depth + 1))
		}

		const sanitized: any = {}
		for (const [key, value] of Object.entries(obj)) {
			const lowerKey = key.toLowerCase()
			const isSensitive = SENSITIVE_FIELDS.some((field) =>
				lowerKey.includes(field.toLowerCase())
			)

			if (isSensitive && typeof value === 'string') {
				sanitized[key] =
					process.env.NODE_ENV === 'production'
						? '[REDACTED]'
						: maskSensitiveValue(value, lowerKey)
			} else if (typeof value === 'object') {
				sanitized[key] = sanitizeObject(value, depth + 1)
			} else {
				sanitized[key] = value
			}
		}
		return sanitized
	}

	return obj
}

/**
 * Logger class with different log levels
 */
class Logger {
	private isDevelopment = process.env.NODE_ENV === 'development'
	private isProduction = process.env.NODE_ENV === 'production'

	/**
	 * Log debug information (development only)
	 */
	debug(message: string, data?: any): void {
		if (!this.isDevelopment) return
		console.log(`[DEBUG] ${message}`, data ? sanitizeObject(data) : '')
	}

	/**
	 * Log informational messages
	 */
	info(message: string, data?: any): void {
		if (this.isProduction && !process.env.ENABLE_PRODUCTION_LOGS) return
		console.log(`[INFO] ${message}`, data ? sanitizeObject(data) : '')
	}

	/**
	 * Log warning messages
	 */
	warn(message: string, data?: any): void {
		console.warn(`[WARN] ${message}`, data ? sanitizeObject(data) : '')
	}

	/**
	 * Log error messages
	 */
	error(message: string, error?: any): void {
		const sanitizedError =
			error instanceof Error
				? {
						message: error.message,
						name: error.name,
						stack: this.isDevelopment
							? error.stack
							: '[Stack hidden in production]',
					}
				: sanitizeObject(error)

		console.error(`[ERROR] ${message}`, sanitizedError || '')
	}

	/**
	 * Log security-related events
	 */
	security(event: string, details?: any): void {
		// Always log security events
		const sanitized = sanitizeObject(details)
		console.log(`[SECURITY] ${event}`, sanitized || '')

		// In production, you might want to send these to a security monitoring service
		if (this.isProduction && process.env.SECURITY_LOG_WEBHOOK) {
			// Send to security monitoring service
			this.sendToSecurityMonitoring(event, sanitized)
		}
	}

	/**
	 * Send security events to monitoring service
	 */
	private async sendToSecurityMonitoring(
		event: string,
		details: any
	): Promise<void> {
		try {
			// Implementation depends on your monitoring service
			// Example: Send to webhook, Sentry, DataDog, etc.
			await fetch(process.env.SECURITY_LOG_WEBHOOK!, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					timestamp: new Date().toISOString(),
					event,
					details,
					environment: process.env.NODE_ENV,
				}),
			})
		} catch {
			// Silently fail to not disrupt application
		}
	}
}

// Export singleton instance
export const logger = new Logger()

// Export for testing
export { sanitizeObject, maskSensitiveValue }
