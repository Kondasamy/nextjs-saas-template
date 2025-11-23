import { NextResponse } from 'next/server'
import { stopImpersonation } from '@/lib/auth/impersonation'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST() {
	try {
		// Apply rate limiting
		await checkRateLimit()

		// Stop impersonation and get admin ID
		const adminId = await stopImpersonation()

		if (!adminId) {
			return NextResponse.json(
				{ error: 'No active impersonation session' },
				{ status: 400 }
			)
		}

		return NextResponse.json({ success: true, adminId })
	} catch (error) {
		console.error('Error stopping impersonation:', error)
		return NextResponse.json(
			{ error: 'Failed to stop impersonation' },
			{ status: 500 }
		)
	}
}
