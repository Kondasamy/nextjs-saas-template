import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { startImpersonation } from '@/lib/auth/impersonation'

const startImpersonationSchema = z.object({
	userId: z.string().min(1),
})

export async function POST(request: Request) {
	try {
		// Verify admin access
		const session = await requireAdmin()

		// Parse and validate request body
		const body = await request.json()
		const { userId } = startImpersonationSchema.parse(body)

		// Start impersonation
		await startImpersonation(session.user.id, userId)

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
