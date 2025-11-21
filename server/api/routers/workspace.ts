import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const workspaceRouter = createTRPCRouter({
	ensureDefault: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED' })
		}

		// Check if user already has a workspace
		const existingMembership = await ctx.prisma.organizationMember.findFirst({
			where: { userId: ctx.user.id },
		})

		if (existingMembership) {
			// User already has a workspace
			return { created: false, workspaceId: existingMembership.organizationId }
		}

		// Generate a unique slug from user's email or name
		const baseSlug = ctx.user.email
			.split('@')[0]
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 30)

		// Ensure slug is unique
		let slug = baseSlug
		let counter = 1
		while (
			await ctx.prisma.organization.findUnique({
				where: { slug },
			})
		) {
			slug = `${baseSlug}-${counter}`
			counter++
		}

		// Create default workspace using a transaction
		const workspaceName =
			ctx.user.name || `${ctx.user.email.split('@')[0]}'s Workspace`

		const result = await ctx.prisma.$transaction(async (tx) => {
			// Create the organization
			const organization = await tx.organization.create({
				data: {
					name: workspaceName,
					slug,
					description: 'My default workspace',
				},
			})

			// Create the Owner role
			const role = await tx.role.create({
				data: {
					organizationId: organization.id,
					name: 'Owner',
					description: 'Workspace owner with full access',
					permissions: ['*'], // All permissions
					isSystem: true,
				},
			})

			// Create the membership
			await tx.organizationMember.create({
				data: {
					organizationId: organization.id,
					userId: ctx.user.id,
					roleId: role.id,
				},
			})

			return organization
		})

		return { created: true, workspaceId: result.id }
	}),

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
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Workspace not found',
				})
			}

			return membership.organization
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				slug: z
					.string()
					.min(1)
					.max(50)
					.regex(/^[a-z0-9-]+$/),
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
			const hasPermission =
				membership.role.permissions.includes('*') ||
				membership.role.permissions.includes('workspace:update')

			if (!hasPermission) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Insufficient permissions',
				})
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
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only owners can delete',
				})
			}

			return ctx.prisma.organization.delete({
				where: { id: input.id },
			})
		}),

	updateMemberRole: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
				roleId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check caller's permissions
			const callerMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!callerMembership) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Not a member of this workspace',
				})
			}

			const hasPermission =
				callerMembership.role.permissions.includes('*') ||
				callerMembership.role.permissions.includes('member:manage')

			if (!hasPermission) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to manage members',
				})
			}

			// Verify role exists and belongs to the organization
			const role = await ctx.prisma.role.findFirst({
				where: {
					id: input.roleId,
					organizationId: input.organizationId,
				},
			})

			if (!role) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Role not found in this workspace',
				})
			}

			// Verify target member exists
			const targetMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: input.userId,
				},
				include: {
					role: true,
				},
			})

			if (!targetMembership) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Member not found in this workspace',
				})
			}

			// Prevent demoting the last owner
			if (targetMembership.role.permissions.includes('*')) {
				const ownerCount = await ctx.prisma.organizationMember.count({
					where: {
						organizationId: input.organizationId,
						role: {
							permissions: {
								equals: ['*'],
							},
						},
					},
				})

				if (ownerCount <= 1 && !role.permissions.includes('*')) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Cannot demote the last owner',
					})
				}
			}

			// Update member role
			const updatedMember = await ctx.prisma.organizationMember.update({
				where: { id: targetMembership.id },
				data: { roleId: input.roleId },
				include: {
					user: true,
					role: true,
				},
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					organizationId: input.organizationId,
					action: 'member.role_updated',
					resource: 'member',
					resourceId: updatedMember.id,
					metadata: {
						targetUserId: input.userId,
						oldRoleId: targetMembership.roleId,
						newRoleId: input.roleId,
						oldRoleName: targetMembership.role.name,
						newRoleName: role.name,
					},
					ipAddress: ctx.req?.headers.get('x-forwarded-for') || undefined,
					userAgent: ctx.req?.headers.get('user-agent') || undefined,
				},
			})

			return updatedMember
		}),

	removeMember: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Check caller's permissions
			const callerMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!callerMembership) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Not a member of this workspace',
				})
			}

			const hasPermission =
				callerMembership.role.permissions.includes('*') ||
				callerMembership.role.permissions.includes('member:remove')

			if (!hasPermission) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to remove members',
				})
			}

			// Verify target member exists
			const targetMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: input.userId,
				},
				include: {
					role: true,
					user: true,
				},
			})

			if (!targetMembership) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Member not found in this workspace',
				})
			}

			// Prevent removing the last owner
			if (targetMembership.role.permissions.includes('*')) {
				const ownerCount = await ctx.prisma.organizationMember.count({
					where: {
						organizationId: input.organizationId,
						role: {
							permissions: {
								equals: ['*'],
							},
						},
					},
				})

				if (ownerCount <= 1) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Cannot remove the last owner',
					})
				}
			}

			// Delete member
			await ctx.prisma.organizationMember.delete({
				where: { id: targetMembership.id },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					organizationId: input.organizationId,
					action: 'member.removed',
					resource: 'member',
					resourceId: targetMembership.id,
					metadata: {
						targetUserId: input.userId,
						targetUserEmail: targetMembership.user.email,
						targetUserName: targetMembership.user.name,
						roleName: targetMembership.role.name,
					},
					ipAddress: ctx.req?.headers.get('x-forwarded-for') || undefined,
					userAgent: ctx.req?.headers.get('user-agent') || undefined,
				},
			})

			return { success: true }
		}),

	transferOwnership: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				newOwnerId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Verify caller is current owner
			const callerMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: ctx.user.id,
				},
				include: {
					role: true,
				},
			})

			if (!callerMembership) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Not a member of this workspace',
				})
			}

			// Only owners (users with '*' permission) can transfer ownership
			if (!callerMembership.role.permissions.includes('*')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only owners can transfer ownership',
				})
			}

			// Verify target user is a member
			const targetMembership = await ctx.prisma.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: input.newOwnerId,
				},
				include: {
					role: true,
					user: true,
				},
			})

			if (!targetMembership) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Target user is not a member of this workspace',
				})
			}

			// Don't allow transferring to someone who's already an owner
			if (targetMembership.role.permissions.includes('*')) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Target user is already an owner',
				})
			}

			// Find or create Owner role
			let ownerRole = await ctx.prisma.role.findFirst({
				where: {
					organizationId: input.organizationId,
					permissions: {
						equals: ['*'],
					},
					isSystem: true,
				},
			})

			if (!ownerRole) {
				// Create owner role if it doesn't exist
				ownerRole = await ctx.prisma.role.create({
					data: {
						organizationId: input.organizationId,
						name: 'Owner',
						description: 'Workspace owner with full access',
						permissions: ['*'],
						isSystem: true,
					},
				})
			}

			// Find or create Admin role for demoted owner
			let adminRole = await ctx.prisma.role.findFirst({
				where: {
					organizationId: input.organizationId,
					name: 'Admin',
					isSystem: true,
				},
			})

			if (!adminRole) {
				// Create admin role if it doesn't exist
				adminRole = await ctx.prisma.role.create({
					data: {
						organizationId: input.organizationId,
						name: 'Admin',
						description: 'Workspace administrator',
						permissions: [
							'workspace:update',
							'member:invite',
							'member:manage',
							'member:remove',
						],
						isSystem: true,
					},
				})
			}

			// Perform the transfer in a transaction
			const result = await ctx.prisma.$transaction(async (tx) => {
				// Demote current owner to admin
				await tx.organizationMember.update({
					where: { id: callerMembership.id },
					data: { roleId: adminRole.id },
				})

				// Promote new owner
				await tx.organizationMember.update({
					where: { id: targetMembership.id },
					data: { roleId: ownerRole.id },
				})

				return { success: true }
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					organizationId: input.organizationId,
					action: 'workspace.ownership_transferred',
					resource: 'workspace',
					resourceId: input.organizationId,
					metadata: {
						previousOwnerId: ctx.user.id,
						previousOwnerEmail: ctx.user.email,
						newOwnerId: input.newOwnerId,
						newOwnerEmail: targetMembership.user.email,
						newOwnerName: targetMembership.user.name,
					},
					ipAddress: ctx.req?.headers.get('x-forwarded-for') || undefined,
					userAgent: ctx.req?.headers.get('user-agent') || undefined,
				},
			})

			// TODO: Send email notifications to both users

			return result
		}),
})
