import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const notificationsRouter = createTRPCRouter({
	list: protectedProcedure
		.input(
			z
				.object({
					read: z.boolean().optional(),
					unreadOnly: z.boolean().optional(), // Alias for read: false
					limit: z.number().min(1).max(100).default(50),
					cursor: z.string().optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			const where: { userId: string; read?: boolean } = {
				userId: ctx.user.id,
			}

			// Handle both read and unreadOnly parameters
			if (input?.unreadOnly) {
				where.read = false
			} else if (input?.read !== undefined) {
				where.read = input.read
			}

			const notifications = await ctx.prisma.notification.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				take: input?.limit ?? 50,
				cursor: input?.cursor ? { id: input.cursor } : undefined,
			})

			// Get unread count for the user
			const unreadCount = await ctx.prisma.notification.count({
				where: {
					userId: ctx.user.id,
					read: false,
				},
			})

			return {
				notifications,
				unreadCount,
				nextCursor:
					notifications.length === (input?.limit ?? 50)
						? notifications[notifications.length - 1]?.id
						: undefined,
			}
		}),

	markAsRead: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			return ctx.prisma.notification.update({
				where: {
					id: input.id,
					userId: ctx.user.id,
				},
				data: {
					read: true,
					readAt: new Date(),
				},
			})
		}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED' })
		}

		return ctx.prisma.notification.updateMany({
			where: {
				userId: ctx.user.id,
				read: false,
			},
			data: {
				read: true,
				readAt: new Date(),
			},
		})
	}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			return ctx.prisma.notification.delete({
				where: {
					id: input.id,
					userId: ctx.user.id,
				},
			})
		}),
})
