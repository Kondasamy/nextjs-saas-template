/**
 * Maintenance Router
 * Handles maintenance mode operations
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isUserAdmin } from '@/lib/auth/admin-helpers'
import {
	disableMaintenanceMode,
	enableMaintenanceMode,
	getMaintenanceStatus,
} from '@/lib/maintenance/server'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const maintenanceRouter = createTRPCRouter({
	/**
	 * Get the current maintenance mode status
	 * Public route - needed to show maintenance banner
	 */
	getStatus: publicProcedure.query(async () => {
		return await getMaintenanceStatus()
	}),

	/**
	 * Enable maintenance mode
	 * Protected route - only admins can enable maintenance mode
	 */
	enable: protectedProcedure
		.input(
			z.object({
				message: z.string().optional(),
				endTime: z.date().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is admin
			const isAdmin = await isUserAdmin(ctx.user.email)
			if (!isAdmin) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only admins can enable maintenance mode',
				})
			}

			await enableMaintenanceMode(input.message, input.endTime, ctx.user.id)

			// Log the action
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'maintenance.enable',
					resource: 'system_settings',
					resourceId: 'system',
					metadata: {
						message: input.message,
						endTime: input.endTime?.toISOString(),
					},
					ipAddress: ctx.ipAddress,
					userAgent: ctx.userAgent,
				},
			})

			return { success: true }
		}),

	/**
	 * Disable maintenance mode
	 * Protected route - only admins can disable maintenance mode
	 */
	disable: protectedProcedure.mutation(async ({ ctx }) => {
		// Check if user is admin
		const isAdmin = await isUserAdmin(ctx.user.email)
		if (!isAdmin) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Only admins can disable maintenance mode',
			})
		}

		await disableMaintenanceMode(ctx.user.id)

		// Log the action
		await ctx.prisma.auditLog.create({
			data: {
				userId: ctx.user.id,
				action: 'maintenance.disable',
				resource: 'system_settings',
				resourceId: 'system',
				ipAddress: ctx.ipAddress,
				userAgent: ctx.userAgent,
			},
		})

		return { success: true }
	}),
})
