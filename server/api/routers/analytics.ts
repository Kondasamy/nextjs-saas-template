import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const analyticsRouter = createTRPCRouter({
	/**
	 * Get dashboard stats
	 */
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id

		// Get user's organizations
		const organizations = await ctx.prisma.organization.count({
			where: {
				members: {
					some: {
						userId,
					},
				},
			},
		})

		// Get total members across all user's organizations
		const totalMembers = await ctx.prisma.organizationMember.count({
			where: {
				organization: {
					members: {
						some: {
							userId,
						},
					},
				},
			},
		})

		// Get total notifications
		const notifications = await ctx.prisma.notification.count({
			where: {
				userId,
				read: false,
			},
		})

		// Get recent activity count (last 7 days)
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

		const recentActivity = await ctx.prisma.auditLog.count({
			where: {
				userId,
				createdAt: {
					gte: sevenDaysAgo,
				},
			},
		})

		return {
			organizations,
			totalMembers,
			unreadNotifications: notifications,
			recentActivity,
		}
	}),

	/**
	 * Get user growth data for charts
	 */
	getUserGrowth: protectedProcedure
		.input(
			z.object({
				organizationId: z.string().optional(),
				days: z.number().min(7).max(90).default(30),
			})
		)
		.query(async ({ ctx, input }) => {
			const { days, organizationId } = input
			const userId = ctx.user.id

			// Verify user has access to organization
			if (organizationId) {
				const membership = await ctx.prisma.organizationMember.findFirst({
					where: {
						userId,
						organizationId,
					},
				})

				if (!membership) {
					throw new Error('Unauthorized')
				}
			}

			const startDate = new Date()
			startDate.setDate(startDate.getDate() - days)

			// Get member join dates
			const members = await ctx.prisma.organizationMember.findMany({
				where: organizationId
					? {
							organizationId,
							joinedAt: {
								gte: startDate,
							},
						}
					: {
							organization: {
								members: {
									some: {
										userId,
									},
								},
							},
							joinedAt: {
								gte: startDate,
							},
						},
				select: {
					joinedAt: true,
				},
				orderBy: {
					joinedAt: 'asc',
				},
			})

			// Group by date
			const growthByDate = members.reduce(
				(acc, member) => {
					const date = member.joinedAt.toISOString().split('T')[0]
					if (!acc[date]) {
						acc[date] = 0
					}
					acc[date]++
					return acc
				},
				{} as Record<string, number>
			)

			// Convert to array and calculate cumulative
			let cumulative = 0
			const data = Object.entries(growthByDate).map(([date, count]) => {
				cumulative += count
				return {
					date,
					new: count,
					total: cumulative,
				}
			})

			return data
		}),

	/**
	 * Get activity metrics
	 */
	getActivityMetrics: protectedProcedure
		.input(
			z.object({
				organizationId: z.string().optional(),
				days: z.number().min(7).max(90).default(7),
			})
		)
		.query(async ({ ctx, input }) => {
			const { days, organizationId } = input
			const userId = ctx.user.id

			// Verify user has access to organization
			if (organizationId) {
				const membership = await ctx.prisma.organizationMember.findFirst({
					where: {
						userId,
						organizationId,
					},
				})

				if (!membership) {
					throw new Error('Unauthorized')
				}
			}

			const startDate = new Date()
			startDate.setDate(startDate.getDate() - days)

			// Get audit logs
			const logs = await ctx.prisma.auditLog.findMany({
				where: organizationId
					? {
							organizationId,
							createdAt: {
								gte: startDate,
							},
						}
					: {
							userId,
							createdAt: {
								gte: startDate,
							},
						},
				select: {
					action: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			})

			// Group by date
			const activityByDate = logs.reduce(
				(acc, log) => {
					const date = log.createdAt.toISOString().split('T')[0]
					if (!acc[date]) {
						acc[date] = 0
					}
					acc[date]++
					return acc
				},
				{} as Record<string, number>
			)

			// Convert to array
			const data = Object.entries(activityByDate).map(([date, count]) => ({
				date,
				activities: count,
			}))

			// Get action breakdown
			const actionBreakdown = logs.reduce(
				(acc, log) => {
					if (!acc[log.action]) {
						acc[log.action] = 0
					}
					acc[log.action]++
					return acc
				},
				{} as Record<string, number>
			)

			return {
				timeline: data,
				breakdown: Object.entries(actionBreakdown).map(([action, count]) => ({
					action,
					count,
				})),
			}
		}),

	/**
	 * Get recent activities for feed
	 */
	getRecentActivities: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(10),
				organizationId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, organizationId } = input
			const userId = ctx.user.id

			// Verify user has access to organization
			if (organizationId) {
				const membership = await ctx.prisma.organizationMember.findFirst({
					where: {
						userId,
						organizationId,
					},
				})

				if (!membership) {
					throw new Error('Unauthorized')
				}
			}

			const activities = await ctx.prisma.auditLog.findMany({
				where: organizationId
					? {
							organizationId,
						}
					: {
							userId,
						},
				include: {
					user: {
						select: {
							name: true,
							email: true,
							image: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				take: limit,
			})

			return activities
		}),
})
