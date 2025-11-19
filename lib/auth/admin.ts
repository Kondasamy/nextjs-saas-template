import { auth } from './config'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function isSuperAdmin(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true },
	})

	// Check if user has super admin role
	// This can be extended to check a specific role or flag
	// For now, we'll use a simple check - you can enhance this
	return false // Implement your super admin logic here
}

export async function canImpersonate(userId: string): Promise<boolean> {
	return await isSuperAdmin(userId)
}

export async function impersonateUser(adminUserId: string, targetUserId: string) {
	if (!(await canImpersonate(adminUserId))) {
		throw new Error('Unauthorized: Cannot impersonate')
	}

	const h = await headers()
	return auth.api.impersonate({
		headers: h,
		body: {
			userId: targetUserId,
		},
	})
}

