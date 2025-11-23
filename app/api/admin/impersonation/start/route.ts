import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { startImpersonation } from '@/lib/auth/impersonation'
import { checkRateLimit, strictRateLimiter } from '@/lib/rate-limit'

const startImpersonationSchema = z.object({
	userId: z.string().min(1),
})

export async function POST(request: Request) {
	try {
		// Apply strict rate limiting for sensitive operation
		await checkRateLimit(strictRateLimiter)

		// Verify admin access
		const admin = await requireAdmin()

		// Parse and validate request body
		const body = await request.json()
		const { userId } = startImpersonationSchema.parse(body)

		// Start impersonation
		await startImpersonation(admin.id, userId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error starting impersonation:', error)

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data' },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Failed to start impersonation' },
			{ status: 500 }
		)
	}
}
