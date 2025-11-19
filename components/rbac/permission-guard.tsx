'use client'

import type { Permission } from '@/lib/rbac/permissions'
import { hasPermission } from '@/lib/rbac/check-permission'
import { usePermissions } from '@/hooks/use-permissions'

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

