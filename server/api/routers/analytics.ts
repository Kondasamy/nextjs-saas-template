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

			// If no real data, generate dummy data for demo purposes
			if (members.length === 0) {
				let cumulative = 50 // Start with base users
				const data = []

				for (let i = 0; i <= days; i++) {
					const date = new Date(startDate)
					date.setDate(date.getDate() + i)
					// Generate random new users between 0 and 10
					const newUsers = Math.floor(Math.random() * 11)
					cumulative += newUsers
					data.push({
						date: date.toISOString().split('T')[0],
						new: newUsers,
						total: cumulative,
					})
				}

				return data
			}

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

	/**
	 * Get revenue data for charts
	 */
	getRevenue: protectedProcedure
		.input(
			z.object({
				from: z.date().optional(),
				to: z.date().optional(),
				organizationId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { from, to, organizationId } = input
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

			// Default to last 30 days if no dates provided
			const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			const endDate = to || new Date()

			// Generate sample revenue data
			// In a real app, this would query actual revenue/transaction data
			const days = Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
			)
			const data = []

			for (let i = 0; i <= days; i++) {
				const date = new Date(startDate)
				date.setDate(date.getDate() + i)
				// Generate sample revenue between 100 and 1000
				const revenue = Math.floor(Math.random() * 900) + 100
				data.push({
					date: date.toISOString().split('T')[0],
					revenue,
				})
			}

			return data
		}),

	/**
	 * Get activity heatmap data
	 */
	getActivityHeatmap: protectedProcedure
		.input(
			z.object({
				from: z.date().optional(),
				to: z.date().optional(),
				organizationId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { from, to, organizationId } = input
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

			// Default to last 30 days if no dates provided
			const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			const endDate = to || new Date()

			// Get audit logs in date range
			const logs = await ctx.prisma.auditLog.findMany({
				where: {
					...(organizationId ? { organizationId } : { userId }),
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				select: {
					createdAt: true,
				},
			})

			// If no real data, generate dummy data for demo purposes
			if (logs.length === 0) {
				const data = []
				for (let day = 0; day < 7; day++) {
					for (let hour = 0; hour < 24; hour++) {
						let count = 0
						// Generate realistic activity patterns
						// More activity on weekdays (Mon-Fri) than weekends (Sat-Sun)
						const isWeekday = day < 5
						// More activity during work hours (9am-5pm)
						const isWorkHours = hour >= 9 && hour <= 17

						if (isWeekday && isWorkHours) {
							// High activity during weekday work hours (5-20 activities)
							count = Math.floor(Math.random() * 16) + 5
						} else if (isWeekday) {
							// Low activity on weekdays outside work hours (0-5 activities)
							count = Math.floor(Math.random() * 6)
						} else if (isWorkHours) {
							// Medium activity on weekends during day (0-8 activities)
							count = Math.floor(Math.random() * 9)
						} else {
							// Very low activity on weekends at night (0-2 activities)
							count = Math.floor(Math.random() * 3)
						}

						data.push({
							dayOfWeek: day,
							hour,
							count,
						})
					}
				}

				return data
			}

			// Group by day of week and hour
			const heatmapData = new Map<string, number>()

			logs.forEach((log) => {
				const date = new Date(log.createdAt)
				const dayOfWeek = (date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
				const hour = date.getHours()
				const key = `${dayOfWeek}-${hour}`
				heatmapData.set(key, (heatmapData.get(key) || 0) + 1)
			})

			// Convert to array format
			const data = []
			for (let day = 0; day < 7; day++) {
				for (let hour = 0; hour < 24; hour++) {
					const key = `${day}-${hour}`
					data.push({
						dayOfWeek: day,
						hour,
						count: heatmapData.get(key) || 0,
					})
				}
			}

			return data
		}),
})
