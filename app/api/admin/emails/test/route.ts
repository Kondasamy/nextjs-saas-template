import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
import { checkRateLimit, strictRateLimiter } from '@/lib/rate-limit'

const testEmailSchema = z.object({
	template: z.enum([
		'welcome',
		'verification',
		'password-reset',
		'magic-link',
		'invitation',
		'two-factor',
	]),
	email: z.string().email(),
})

export async function POST(request: Request) {
	try {
		// Apply strict rate limiting to prevent email spam
		await checkRateLimit(strictRateLimiter)

		// Verify admin access
		await requireAdmin()

		// Check if RESEND_API_KEY is configured
		if (!env.RESEND_API_KEY) {
			return NextResponse.json(
				{
					error:
						'Email service not configured. Please set RESEND_API_KEY in your environment variables.',
				},
				{ status: 400 }
			)
		}

		// Parse and validate request body
		const body = await request.json()
		const { template, email } = testEmailSchema.parse(body)

		// Send test email based on template
		switch (template) {
			case 'welcome':
				await EmailService.sendWelcome(email, 'Test User')
				break

			case 'verification':
				await EmailService.sendVerification(
					email,
					`${env.NEXT_PUBLIC_APP_URL}/verify-email?token=test-token`,
					'123456'
				)
				break

			case 'password-reset':
				await EmailService.sendPasswordReset(
					email,
					'Test User',
					`${env.NEXT_PUBLIC_APP_URL}/reset-password?token=test-token`
				)
				break

			case 'magic-link':
				await EmailService.sendMagicLink(
					email,
					`${env.NEXT_PUBLIC_APP_URL}/verify-magic-link?token=test-token`
				)
				break

			case 'invitation':
				await EmailService.sendInvitation(
					email,
					'Jane Smith',
					'Acme Corp',
					'Member',
					`${env.NEXT_PUBLIC_APP_URL}/accept-invite?token=test-token`
				)
				break

			case 'two-factor':
				await EmailService.send2FACode(email, 'Test User', '789012')
				break

			default:
				return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
		}

		return NextResponse.json({
			success: true,
			message: `Test email sent to ${email}`,
		})
	} catch (error) {
		console.error('Error sending test email:', error)

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: error.errors },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Failed to send test email' },
			{ status: 500 }
		)
	}
}
