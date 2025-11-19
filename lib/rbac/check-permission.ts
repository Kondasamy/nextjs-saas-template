import type { Permission } from './permissions'

export function hasPermission(
	userPermissions: string[],
	requiredPermission: Permission
): boolean {
	// Wildcard permission grants everything
	if (userPermissions.includes('*')) {
		return true
	}

	// Exact match
	if (userPermissions.includes(requiredPermission)) {
		return true
	}

	// Check for wildcard resource permissions (e.g., 'resource:*' matches 'resource:read')
	const [resource, action] = requiredPermission.split(':')
	if (resource && action) {
		const resourceWildcard = `${resource}:*`
		if (userPermissions.includes(resourceWildcard)) {
			return true
		}
	}

	return false
}

export function hasAnyPermission(
	userPermissions: string[],
	requiredPermissions: Permission[]
): boolean {
	return requiredPermissions.some((permission) =>
		hasPermission(userPermissions, permission)
	)
}

export function hasAllPermissions(
	userPermissions: string[],
	requiredPermissions: Permission[]
): boolean {
	return requiredPermissions.every((permission) =>
		hasPermission(userPermissions, permission)
	)
}

