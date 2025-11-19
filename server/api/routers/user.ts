import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.user.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					createdAt: true,
				},
			})
		}),

	getCurrent: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			return null
		}

		return ctx.prisma.user.findUnique({
			where: { id: ctx.user.id },
			include: {
				organizations: {
					include: {
						organization: true,
						role: true,
					},
				},
			},
		})
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).optional(),
				image: z.string().url().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			return ctx.prisma.user.update({
				where: { id: ctx.user.id },
				data: {
					name: input.name,
					image: input.image,
				},
			})
		}),

	deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		return ctx.prisma.user.delete({
			where: { id: ctx.user.id },
		})
	}),
})
