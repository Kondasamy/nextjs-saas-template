import { render } from '@react-email/components'
import { NextResponse } from 'next/server'
import { InvitationEmail } from '@/emails/invitation'
import MagicLinkEmail from '@/emails/magic-link'
import PasswordResetEmail from '@/emails/password-reset'
import TwoFactorEmail from '@/emails/two-factor'
import { VerificationEmail } from '@/emails/verification'
import { WelcomeEmail } from '@/emails/welcome'

/**
 * Email preview route for development
 * Access at: /api/email/preview?template=welcome
 *
 * Available templates:
 * - welcome
 * - verification
 * - password-reset
 * - magic-link
 * - invitation
 * - two-factor
 */
export async function GET(request: Request) {
	// Only allow in development
	if (process.env.NODE_ENV === 'production') {
		return NextResponse.json(
			{ error: 'Not available in production' },
			{ status: 404 }
		)
	}

	const { searchParams } = new URL(request.url)
	const template = searchParams.get('template')

	let html: string

	try {
		switch (template) {
			case 'welcome':
				html = await render(WelcomeEmail({ name: 'John Doe' }))
				break

			case 'verification':
				html = await render(
					VerificationEmail({
						verificationUrl: 'http://localhost:3000/verify-email?token=sample',
						name: 'John Doe',
						code: '123456',
					})
				)
				break

			case 'password-reset':
				html = await render(
					PasswordResetEmail({
						name: 'John Doe',
						resetUrl: 'http://localhost:3000/reset-password?token=sample',
					})
				)
				break

			case 'magic-link':
				html = await render(
					MagicLinkEmail({
						magicLink: 'http://localhost:3000/auth/magic?token=sample',
					})
				)
				break

			case 'invitation':
				html = await render(
					InvitationEmail({
						inviterName: 'Jane Smith',
						organizationName: 'Acme Corp',
						invitationUrl: 'http://localhost:3000/invitations/sample-token',
					})
				)
				break

			case 'two-factor':
				html = await render(
					TwoFactorEmail({
						name: 'John Doe',
						code: '123456',
					})
				)
				break

			default:
				return NextResponse.json(
					{
						error: 'Invalid template',
						available: [
							'welcome',
							'verification',
							'password-reset',
							'magic-link',
							'invitation',
							'two-factor',
						],
					},
					{ status: 400 }
				)
		}

		return new NextResponse(html, {
			headers: {
				'Content-Type': 'text/html',
			},
		})
	} catch (error) {
		console.error('Error rendering email template:', error)
		return NextResponse.json(
			{ error: 'Failed to render template' },
			{ status: 500 }
		)
	}
}
