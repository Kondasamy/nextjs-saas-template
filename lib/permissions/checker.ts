import { PERMISSIONS } from './constants'

/**
 * Check if user has the required permission
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(
	userPermissions: string[],
	requiredPermission: string
): boolean {
	// If user has wildcard permission, they have all permissions
	if (userPermissions.includes(PERMISSIONS.ALL)) {
		return true
	}

	// Check for exact permission match
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

/**
 * Check if user has any of the required permissions
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check for (OR logic)
 * @returns true if user has any of the permissions, false otherwise
 */
export function hasAnyPermission(
	userPermissions: string[],
	requiredPermissions: string[]
): boolean {
	// If user has wildcard permission, they have all permissions
	if (userPermissions.includes(PERMISSIONS.ALL)) {
		return true
	}

	// Check if user has any of the required permissions
	return requiredPermissions.some((perm) => userPermissions.includes(perm))
}

/**
 * Check if user has all of the required permissions
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check for (AND logic)
 * @returns true if user has all of the permissions, false otherwise
 */
export function hasAllPermissions(
	userPermissions: string[],
	requiredPermissions: string[]
): boolean {
	// If user has wildcard permission, they have all permissions
	if (userPermissions.includes(PERMISSIONS.ALL)) {
		return true
	}

	// Check if user has all of the required permissions
	return requiredPermissions.every((perm) => userPermissions.includes(perm))
}

/**
 * Check if user is owner (has wildcard permission)
 * @param userPermissions - Array of permissions the user has
 * @returns true if user is owner, false otherwise
 */
export function isOwner(userPermissions: string[]): boolean {
	return userPermissions.includes(PERMISSIONS.ALL)
}

/**
 * Get missing permissions from a list of required permissions
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check for
 * @returns Array of missing permissions
 */
export function getMissingPermissions(
	userPermissions: string[],
	requiredPermissions: string[]
): string[] {
	// If user has wildcard permission, they have no missing permissions
	if (userPermissions.includes(PERMISSIONS.ALL)) {
		return []
	}

	// Filter out permissions the user already has
	return requiredPermissions.filter((perm) => !userPermissions.includes(perm))
}

/**
 * Client-side hook to check permissions
 * This is a utility for React components
 */
export function usePermissions() {
	// This would typically get user permissions from context or state
	// For now, we'll return the checker functions
	return {
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		isOwner,
		getMissingPermissions,
	}
}
