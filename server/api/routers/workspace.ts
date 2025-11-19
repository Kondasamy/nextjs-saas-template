import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const workspaceRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED' })
		}

		const memberships = await ctx.prisma.organizationMember.findMany({
			where: { userId: ctx.user.id },
			include: {
				organization: true,
				role: true,
			},
		})

		return memberships.map((m) => ({
			id: m.organization.id,
			name: m.organization.name,
			slug: m.organization.slug,
			description: m.organization.description,
			logo: m.organization.logo,
			role: m.role,
			joinedAt: m.joinedAt,
		}))
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			const membership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.id,
					userId: ctx.user.id,
				},
				include: {
					organization: {
						include: {
							members: {
								include: {
									user: true,
									role: true,
								},
							},
						},
					},
					role: true,
				},
			})

			if (!membership) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })
			}

			return membership.organization
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
				description: z.string().max(500).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check if slug is already taken
			const existing = await ctx.prisma.organization.findUnique({
				where: { slug: input.slug },
			})

			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Workspace slug already exists',
				})
			}

			// Create organization with owner role
			const organization = await ctx.prisma.organization.create({
				data: {
					name: input.name,
					slug: input.slug,
					description: input.description,
					members: {
						create: {
							userId: ctx.user.id,
							role: {
								create: {
									name: 'Owner',
									description: 'Workspace owner with full access',
									permissions: ['*'], // All permissions
									isSystem: true,
								},
							},
						},
					},
				},
				include: {
					members: {
						include: {
							user: true,
							role: true,
						},
					},
				},
			})

			return organization
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				logo: z.string().url().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check if user is member of workspace
			const membership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.id,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!membership) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member' })
			}

			// Check permissions (simplified - you can enhance this)
			const hasPermission = membership.role.permissions.includes('*') ||
				membership.role.permissions.includes('workspace:update')

			if (!hasPermission) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' })
			}

			return ctx.prisma.organization.update({
				where: { id: input.id },
				data: {
					name: input.name,
					description: input.description,
					logo: input.logo,
				},
			})
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check if user is owner
			const membership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.id,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!membership || !membership.role.permissions.includes('*')) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners can delete' })
			}

			return ctx.prisma.organization.delete({
				where: { id: input.id },
			})
		}),
})

