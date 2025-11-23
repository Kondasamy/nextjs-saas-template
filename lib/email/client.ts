import { Resend } from 'resend'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export async function sendEmail({
	to,
	subject,
	html,
	text,
}: {
	to: string | string[]
	subject: string
	html?: string
	text?: string
}) {
	if (!resend) {
		logger.warn('Resend API key not configured, email not sent')
		return { success: false, error: 'Email service not configured' }
	}

	try {
		const { data, error } = await resend.emails.send({
			from: env.EMAIL_FROM_ADDRESS ?? 'noreply@example.com',
			to: Array.isArray(to) ? to : [to],
			subject,
			html,
			text,
		})

		if (error) {
			logger.error('Failed to send email', error)
			return { success: false, error }
		}

		return { success: true, data }
	} catch (error) {
		logger.error('Error sending email', error)
		return { success: false, error }
	}
}
