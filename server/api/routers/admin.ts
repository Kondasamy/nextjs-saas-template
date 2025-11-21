import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const adminRouter = createTRPCRouter({
	/**
	 * Get all users (admin only)
	 */
	getAllUsers: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				search: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, offset, search } = input

			// TODO: Add admin check here
			// if (!isAdmin(ctx.user)) throw new Error('Unauthorized')

			const where = search
				? {
						OR: [
							{ email: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {}

			const [users, total] = await Promise.all([
				ctx.prisma.user.findMany({
					where,
					take: limit,
					skip: offset,
					orderBy: { createdAt: 'desc' },
					include: {
						organizations: {
							include: {
								organization: true,
								role: true,
							},
						},
						_count: {
							select: {
								organizations: true,
							},
						},
					},
				}),
				ctx.prisma.user.count({ where }),
			])

			return {
				users,
				total,
				hasMore: offset + limit < total,
			}
		}),

	/**
	 * Get system statistics (admin only)
	 */
	getSystemStats: protectedProcedure.query(async ({ ctx }) => {
		// TODO: Add admin check

		const [
			totalUsers,
			totalOrganizations,
			totalMembers,
			recentUsers,
			activeUsers,
		] = await Promise.all([
			ctx.prisma.user.count(),
			ctx.prisma.organization.count(),
			ctx.prisma.organizationMember.count(),
			ctx.prisma.user.count({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
					},
				},
			}),
			ctx.prisma.user.count({
				where: {
					updatedAt: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
					},
				},
			}),
		])

		return {
			totalUsers,
			totalOrganizations,
			totalMembers,
			recentUsers,
			activeUsers,
		}
	}),

	/**
	 * Get all audit logs (admin only)
	 */
	getAuditLogs: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				userId: z.string().optional(),
				organizationId: z.string().optional(),
				action: z.string().optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const {
				limit,
				offset,
				userId,
				organizationId,
				action,
				startDate,
				endDate,
			} = input

			// TODO: Add admin check

			const where: any = {}

			if (userId) where.userId = userId
			if (organizationId) where.organizationId = organizationId
			if (action) where.action = action
			if (startDate || endDate) {
				where.createdAt = {}
				if (startDate) where.createdAt.gte = startDate
				if (endDate) where.createdAt.lte = endDate
			}

			const [logs, total] = await Promise.all([
				ctx.prisma.auditLog.findMany({
					where,
					take: limit,
					skip: offset,
					orderBy: { createdAt: 'desc' },
					include: {
						user: {
							select: {
								id: true,
								email: true,
								name: true,
								image: true,
							},
						},
					},
				}),
				ctx.prisma.auditLog.count({ where }),
			])

			return {
				logs,
				total,
				hasMore: offset + limit < total,
			}
		}),

	/**
	 * Delete user (admin only)
	 */
	deleteUser: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// TODO: Add admin check
			// Prevent deleting yourself
			if (input.userId === ctx.user.id) {
				throw new Error('Cannot delete your own account')
			}

			return ctx.prisma.user.delete({
				where: { id: input.userId },
			})
		}),

	/**
	 * Update user status (admin only)
	 */
	updateUserStatus: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				banned: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Add admin check

			return ctx.prisma.user.update({
				where: { id: input.userId },
				data: {
					banned: input.banned,
				},
			})
		}),
})
