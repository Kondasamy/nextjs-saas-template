/**
 * Theme Router
 * Handles theme management operations
 */

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import {
	AVAILABLE_THEMES,
	getThemeById,
	isValidTheme,
} from '@/lib/theme/config'
import { getActiveTheme, getThemeCSS, setActiveTheme } from '@/lib/theme/server'
import { isUserAdmin } from '@/lib/auth/admin-helpers'
import { TRPCError } from '@trpc/server'

export const themeRouter = createTRPCRouter({
	/**
	 * Get all available themes
	 * Public route - anyone can see available themes
	 */
	getAvailableThemes: publicProcedure.query(() => {
		return AVAILABLE_THEMES
	}),

	/**
	 * Get the currently active theme
	 * Public route - needed to render the app correctly
	 */
	getActiveTheme: publicProcedure.query(async () => {
		const themeId = await getActiveTheme()
		const theme = getThemeById(themeId)

		return {
			id: themeId,
			...theme,
		}
	}),

	/**
	 * Get CSS content for a specific theme
	 * Public route - needed to load theme styles
	 */
	getThemeCSS: publicProcedure
		.input(z.object({ themeId: z.string() }))
		.query(async ({ input }) => {
			const css = await getThemeCSS(input.themeId)
			return { css }
		}),

	/**
	 * Set the active theme
	 * Protected route - only admins can change themes
	 */
	setActiveTheme: protectedProcedure
		.input(
			z.object({
				themeId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is admin
			const isAdmin = await isUserAdmin(ctx.user.email)
			if (!isAdmin) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only admins can change themes',
				})
			}

			if (!isValidTheme(input.themeId)) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Invalid theme ID: ${input.themeId}`,
				})
			}

			await setActiveTheme(input.themeId, ctx.user.id)

			// Log the theme change
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'theme.change',
					resource: 'system_settings',
					resourceId: 'system',
					metadata: {
						themeId: input.themeId,
					},
					ipAddress: ctx.ipAddress,
					userAgent: ctx.userAgent,
				},
			})

			return { success: true, themeId: input.themeId }
		}),
})
