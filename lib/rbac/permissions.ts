// Permission definitions for RBAC system
// Permissions are organized by resource and action

export const PERMISSIONS = {
	// Workspace permissions
	'workspace:read': 'View workspace details',
	'workspace:update': 'Update workspace settings',
	'workspace:delete': 'Delete workspace',
	'workspace:manage': 'Full workspace management',

	// Member permissions
	'member:read': 'View workspace members',
	'member:invite': 'Invite new members',
	'member:remove': 'Remove members',
	'member:update': 'Update member roles',
	'member:manage': 'Full member management',

	// Role permissions
	'role:read': 'View roles',
	'role:create': 'Create roles',
	'role:update': 'Update roles',
	'role:delete': 'Delete roles',
	'role:manage': 'Full role management',

	// Resource permissions (example)
	'resource:read': 'View resources',
	'resource:create': 'Create resources',
	'resource:update': 'Update resources',
	'resource:delete': 'Delete resources',
	'resource:manage': 'Full resource management',

	// Admin permissions
	'admin:access': 'Access admin panel',
	'admin:manage': 'Full admin access',

	// Wildcard for all permissions
	'*': 'All permissions',
} as const

export type Permission = keyof typeof PERMISSIONS

// Default roles with permissions
export const DEFAULT_ROLES = {
	Owner: ['*'], // All permissions
	Admin: [
		'workspace:read',
		'workspace:update',
		'member:read',
		'member:invite',
		'member:remove',
		'member:update',
		'role:read',
		'role:create',
		'role:update',
		'resource:*',
	],
	Member: [
		'workspace:read',
		'member:read',
		'resource:read',
		'resource:create',
		'resource:update',
	],
	Viewer: ['workspace:read', 'member:read', 'resource:read'],
} as const

