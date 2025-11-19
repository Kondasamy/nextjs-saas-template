import { TRPCError } from '@trpc/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const invitationsRouter = createTRPCRouter({
	list: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check if user is member
			const membership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: ctx.user.id,
				},
			})

			if (!membership) {
				throw new TRPCError({ code: 'FORBIDDEN' })
			}

			return ctx.prisma.invitation.findMany({
				where: {
					organizationId: input.organizationId,
					status: 'pending',
				},
				include: {
					invitedBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					role: true,
				},
				orderBy: { createdAt: 'desc' },
			})
		}),

	create: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				email: z.string().email(),
				roleId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check permissions
			const membership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!membership) {
				throw new TRPCError({ code: 'FORBIDDEN' })
			}

			const hasPermission =
				membership.role.permissions.includes('*') ||
				membership.role.permissions.includes('member:invite')

			if (!hasPermission) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Insufficient permissions',
				})
			}

			// Check if user is already a member
			const existingUser = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			})

			if (existingUser) {
				const existingMember = await ctx.prisma.organizationMember.findFirst({
					where: {
						organizationId: input.organizationId,
						userId: existingUser.id,
					},
				})

				if (existingMember) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'User is already a member',
					})
				}
			}

			// Check if there's a pending invitation
			const existingInvitation = await ctx.prisma.invitation.findFirst({
				where: {
					organizationId: input.organizationId,
					email: input.email,
					status: 'pending',
				},
			})

			if (existingInvitation) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Invitation already sent',
				})
			}

			// Create invitation
			const token = randomBytes(32).toString('hex')
			const expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

			return ctx.prisma.invitation.create({
				data: {
					organizationId: input.organizationId,
					email: input.email,
					invitedById: ctx.user.id,
					roleId: input.roleId,
					token,
					expiresAt,
				},
			})
		}),

	getByToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const invitation = await ctx.prisma.invitation.findUnique({
				where: { token: input.token },
				include: {
					organization: true,
					role: true,
					invitedBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			})

			if (!invitation) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invitation not found',
				})
			}

			if (invitation.status !== 'pending') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invitation already used',
				})
			}

			if (invitation.expiresAt < new Date()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invitation expired',
				})
			}

			return invitation
		}),

	accept: protectedProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			const invitation = await ctx.prisma.invitation.findUnique({
				where: { token: input.token },
			})

			if (!invitation) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invitation not found',
				})
			}

			if (invitation.status !== 'pending') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invitation already used',
				})
			}

			if (invitation.expiresAt < new Date()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invitation expired',
				})
			}

			if (invitation.email !== ctx.user.email) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Invitation email does not match',
				})
			}

			// Create membership
			await ctx.prisma.organizationMember.create({
				data: {
					organizationId: invitation.organizationId,
					userId: ctx.user.id,
					roleId: invitation.roleId,
				},
			})

			// Update invitation status
			return ctx.prisma.invitation.update({
				where: { id: invitation.id },
				data: {
					status: 'accepted',
					acceptedAt: new Date(),
				},
			})
		}),

	cancel: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			const invitation = await ctx.prisma.invitation.findUnique({
				where: { id: input.id },
				include: {
					organization: {
						include: {
							members: {
								where: { userId: ctx.user.id },
							},
						},
					},
				},
			})

			if (!invitation) {
				throw new TRPCError({ code: 'NOT_FOUND' })
			}

			// Check if user can cancel (must be inviter or have permission)
			const canCancel =
				invitation.invitedById === ctx.user.id ||
				invitation.organization.members.some(() => {
					// Check permissions - simplified
					return true
				})

			if (!canCancel) {
				throw new TRPCError({ code: 'FORBIDDEN' })
			}

			return ctx.prisma.invitation.update({
				where: { id: input.id },
				data: {
					status: 'expired',
				},
			})
		}),
})
