import { render } from '@react-email/components'
import { Resend } from 'resend'
import { InvitationEmail } from '@/emails/invitation'
import MagicLinkEmail from '@/emails/magic-link'
import PasswordResetEmail from '@/emails/password-reset'
import TwoFactorEmail from '@/emails/two-factor'
import { VerificationEmail } from '@/emails/verification'
import { WelcomeEmail } from '@/emails/welcome'
import { env } from '@/lib/env'
import { NAME } from '../constants'

const resend = new Resend(env.RESEND_API_KEY)

const FROM_EMAIL =
	env.EMAIL_FROM_ADDRESS ||
	`noreply@${NAME.toLowerCase().replace(/\s/g, '')}.com`
const FROM_NAME = env.EMAIL_FROM_NAME || NAME

interface SendEmailOptions {
	to: string
	subject: string
	html: string
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
	try {
		const { data, error } = await resend.emails.send({
			from: `${FROM_NAME} <${FROM_EMAIL}>`,
			to,
			subject,
			html,
		})

		if (error) {
			console.error('Error sending email:', error)
			throw new Error(`Failed to send email: ${error.message}`)
		}

		return data
	} catch (error) {
		console.error('Error sending email:', error)
		throw error
	}
}

export class EmailService {
	/**
	 * Send welcome email to new users
	 */
	static async sendWelcome(to: string, name: string) {
		const html = await render(WelcomeEmail({ name }))

		return sendEmail({
			to,
			subject: `Welcome to ${NAME}!`,
			html,
		})
	}

	/**
	 * Send email verification
	 */
	static async sendVerification(
		to: string,
		verificationUrl: string,
		code?: string
	) {
		const html = await render(
			VerificationEmail({ verificationUrl, name: to.split('@')[0], code })
		)

		return sendEmail({
			to,
			subject: 'Verify your email address',
			html,
		})
	}

	/**
	 * Send password reset email
	 */
	static async sendPasswordReset(to: string, name: string, resetUrl: string) {
		const html = await render(PasswordResetEmail({ name, resetUrl }))

		return sendEmail({
			to,
			subject: 'Reset your password',
			html,
		})
	}

	/**
	 * Send magic link for passwordless login
	 */
	static async sendMagicLink(to: string, magicLink: string) {
		const html = await render(MagicLinkEmail({ magicLink }))

		return sendEmail({
			to,
			subject: 'Sign in to your account',
			html,
		})
	}

	/**
	 * Send team invitation
	 */
	static async sendInvitation(
		to: string,
		inviterName: string,
		organizationName: string,
		role: string,
		invitationUrl: string
	) {
		const html = await render(
			InvitationEmail({
				inviterName,
				organizationName,
				invitationUrl,
			})
		)

		return sendEmail({
			to,
			subject: `You've been invited to join ${organizationName}`,
			html,
		})
	}

	/**
	 * Send 2FA code
	 */
	static async send2FACode(to: string, name: string, code: string) {
		const html = await render(TwoFactorEmail({ name, code }))

		return sendEmail({
			to,
			subject: 'Your two-factor authentication code',
			html,
		})
	}

	/**
	 * Generic email sender with custom HTML
	 */
	static async sendCustom(to: string, subject: string, html: string) {
		return sendEmail({ to, subject, html })
	}
}
