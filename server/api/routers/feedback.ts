import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const feedbackRouter = createTRPCRouter({
	/**
	 * Submit feedback
	 */
	submitFeedback: protectedProcedure
		.input(
			z.object({
				category: z.enum([
					'Bug Report',
					'Feature Request',
					'Improvement',
					'Other',
				]),
				message: z.string().min(10, 'Message must be at least 10 characters'),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Get admin emails from environment variable
			const adminEmails = env.ADMIN_EMAILS?.split(',').map((email) =>
				email.trim()
			) || ['admin@example.com']

			// Send email to all admins
			try {
				await Promise.all(
					adminEmails.map((adminEmail) =>
						EmailService.sendFeedback(
							adminEmail,
							ctx.user.name,
							ctx.user.email,
							input.category,
							input.message
						)
					)
				)
			} catch (error) {
				logger.error('Failed to send feedback email', error)
				// Don't throw error - we still want to acknowledge the submission
			}

			return {
				success: true,
				message: 'Feedback submitted successfully',
			}
		}),

	/**
	 * Submit support request
	 */
	submitSupport: protectedProcedure
		.input(
			z.object({
				subject: z.string().min(5, 'Subject must be at least 5 characters'),
				priority: z.enum(['Low', 'Medium', 'High']),
				message: z.string().min(10, 'Message must be at least 10 characters'),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Get admin emails from environment variable
			const adminEmails = env.ADMIN_EMAILS?.split(',').map((email) =>
				email.trim()
			) || ['admin@example.com']

			// Send email to all admins
			try {
				await Promise.all(
					adminEmails.map((adminEmail) =>
						EmailService.sendSupport(
							adminEmail,
							ctx.user.name,
							ctx.user.email,
							input.subject,
							input.priority,
							input.message
						)
					)
				)
			} catch (error) {
				logger.error('Failed to send support email', error)
				// Don't throw error - we still want to acknowledge the submission
			}

			return {
				success: true,
				message: 'Support request submitted successfully',
			}
		}),
})
