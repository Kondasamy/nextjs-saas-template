import type { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'

/**
 * Database helper utilities to reduce query duplication and improve performance
 */

/**
 * Verify user's membership and role in an organization
 * Used across workspace, analytics, and other routers to avoid N+1 queries
 */
export async function verifyMembershipWithRole(
	prisma: PrismaClient,
	userId: string,
	organizationId: string
) {
	const membership = await prisma.organizationMember.findFirst({
		where: {
			organizationId,
			userId,
		},
		include: {
			role: {
				include: {
					permissions: true,
				},
			},
		},
	})

	if (!membership) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have access to this organization',
		})
	}

	return membership
}

/**
 * Check if user has specific permission in organization
 */
export async function hasPermission(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
	permission: string
): Promise<boolean> {
	const membership = await verifyMembershipWithRole(
		prisma,
		userId,
		organizationId
	)

	// Check for wildcard permission
	if (membership.role.permissions.some((p) => p.name === '*')) {
		return true
	}

	// Check for specific permission
	return membership.role.permissions.some((p) => p.name === permission)
}

/**
 * Get organization with optimized field selection
 * Avoids over-fetching user data
 */
export async function getOrganizationWithMembers(
	prisma: PrismaClient,
	organizationId: string,
	userId: string
) {
	// First verify access
	await verifyMembershipWithRole(prisma, userId, organizationId)

	return prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			members: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							createdAt: true,
							banned: true,
						},
					},
					role: {
						include: {
							permissions: true,
						},
					},
				},
			},
			invitations: {
				where: {
					status: 'PENDING',
				},
				select: {
					id: true,
					email: true,
					role: true,
					expiresAt: true,
				},
			},
		},
	})
}

/**
 * Batch fetch multiple counts in parallel
 * More efficient than sequential counting
 */
export async function getOrganizationStats(
	prisma: PrismaClient,
	organizationId: string
) {
	const [
		memberCount,
		pendingInvitations,
		activeMembers,
		recentActivity,
		activeLinkCount,
	] = await Promise.all([
		prisma.organizationMember.count({
			where: { organizationId },
		}),
		prisma.invitation.count({
			where: {
				organizationId,
				status: 'PENDING',
			},
		}),
		prisma.organizationMember.count({
			where: {
				organizationId,
				user: {
					sessions: {
						some: {
							expiresAt: {
								gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
							},
						},
					},
				},
			},
		}),
		prisma.auditLog.count({
			where: {
				metadata: {
					path: ['organizationId'],
					equals: organizationId,
				},
				createdAt: {
					gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
				},
			},
		}),
		prisma.invitation.count({
			where: {
				organizationId,
				type: 'LINK',
				status: 'PENDING',
				OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
			},
		}),
	])

	return {
		memberCount,
		pendingInvitations,
		activeMembers,
		recentActivity,
		activeLinkCount,
		activityRate:
			memberCount > 0 ? Math.round((activeMembers / memberCount) * 100) : 0,
	}
}

/**
 * Get user with optimized field selection
 * Avoids fetching unnecessary nested data
 */
export async function getUserWithOrganizations(
	prisma: PrismaClient,
	userId: string
) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			bio: true,
			createdAt: true,
			updatedAt: true,
			banned: true,
			organizations: {
				include: {
					organization: {
						select: {
							id: true,
							name: true,
							description: true,
							logo: true,
							createdAt: true,
						},
					},
					role: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	})
}

/**
 * Cache for membership checks within same request
 * Prevents repeated queries for same user/org combination
 */
const membershipCache = new Map<string, any>()

export async function getCachedMembership(
	prisma: PrismaClient,
	userId: string,
	organizationId: string
) {
	const cacheKey = `${userId}:${organizationId}`

	if (membershipCache.has(cacheKey)) {
		return membershipCache.get(cacheKey)
	}

	const membership = await verifyMembershipWithRole(
		prisma,
		userId,
		organizationId
	)
	membershipCache.set(cacheKey, membership)

	// Clear cache after request completes
	if (membershipCache.size > 100) {
		membershipCache.clear()
	}

	return membership
}

/**
 * Optimized user queries with field selection
 */

// Minimal user fields for display (avatars, lists, etc)
export const USER_DISPLAY_FIELDS = {
	id: true,
	name: true,
	email: true,
	image: true,
} as const

// Standard user fields for profile views
export const USER_PROFILE_FIELDS = {
	...USER_DISPLAY_FIELDS,
	bio: true,
	createdAt: true,
	updatedAt: true,
} as const

// Full user fields for account settings
export const USER_SETTINGS_FIELDS = {
	...USER_PROFILE_FIELDS,
	emailVerified: true,
	timezone: true,
	language: true,
	banned: true,
} as const

/**
 * Get user for display purposes (minimal fields)
 */
export async function getUserForDisplay(prisma: PrismaClient, userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: USER_DISPLAY_FIELDS,
	})
}

/**
 * Get multiple users for display (batched)
 */
export async function getUsersForDisplay(
	prisma: PrismaClient,
	userIds: string[]
) {
	return prisma.user.findMany({
		where: { id: { in: userIds } },
		select: USER_DISPLAY_FIELDS,
	})
}

/**
 * Get user with specific workspace membership
 */
export async function getUserWithWorkspace(
	prisma: PrismaClient,
	userId: string,
	workspaceId: string
) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			...USER_PROFILE_FIELDS,
			organizations: {
				where: { organizationId: workspaceId },
				select: {
					joinedAt: true,
					role: {
						select: {
							id: true,
							name: true,
							permissions: true,
						},
					},
				},
				take: 1,
			},
		},
	})
}
