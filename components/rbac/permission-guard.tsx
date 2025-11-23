'use client'

import { usePermissions } from '@/hooks/use-permissions'
import { hasPermission } from '@/lib/permissions/checker'
import type { Permission } from '@/lib/rbac/permissions'

interface PermissionGuardProps {
	permission: Permission
	fallback?: React.ReactNode
	children: React.ReactNode
}

export function PermissionGuard({
	permission,
	fallback = null,
	children,
}: PermissionGuardProps) {
	const { permissions } = usePermissions()

	if (!hasPermission(permissions, permission)) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
