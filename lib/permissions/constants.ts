/**
 * Permission constants for the application
 * These are the granular permissions that can be assigned to roles
 */

export const PERMISSIONS = {
	ALL: '*', // Super admin permission

	WORKSPACE: {
		UPDATE: 'workspace:update',
		DELETE: 'workspace:delete',
		VIEW: 'workspace:view',
	},

	MEMBER: {
		INVITE: 'member:invite',
		REMOVE: 'member:remove',
		MANAGE: 'member:manage',
		VIEW: 'member:view',
	},

	ROLE: {
		CREATE: 'role:create',
		UPDATE: 'role:update',
		DELETE: 'role:delete',
		VIEW: 'role:view',
	},

	CONTENT: {
		CREATE: 'content:create',
		UPDATE: 'content:update',
		DELETE: 'content:delete',
		VIEW: 'content:view',
	},

	SETTINGS: {
		VIEW: 'settings:view',
		UPDATE: 'settings:update',
	},
} as const

export type PermissionKey = string

export interface PermissionDefinition {
	key: string
	name: string
	description: string
	category: string
}

/**
 * Human-readable permission definitions
 */
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
	{
		key: PERMISSIONS.ALL,
		name: 'All Permissions',
		description: 'Full access to all workspace features and settings',
		category: 'Admin',
	},

	// Workspace permissions
	{
		key: PERMISSIONS.WORKSPACE.VIEW,
		name: 'View Workspace',
		description: 'View workspace details and settings',
		category: 'Workspace',
	},
	{
		key: PERMISSIONS.WORKSPACE.UPDATE,
		name: 'Update Workspace',
		description: 'Update workspace name, description, and logo',
		category: 'Workspace',
	},
	{
		key: PERMISSIONS.WORKSPACE.DELETE,
		name: 'Delete Workspace',
		description: 'Delete or archive the workspace',
		category: 'Workspace',
	},

	// Member permissions
	{
		key: PERMISSIONS.MEMBER.VIEW,
		name: 'View Members',
		description: 'View workspace members and their roles',
		category: 'Members',
	},
	{
		key: PERMISSIONS.MEMBER.INVITE,
		name: 'Invite Members',
		description: 'Send invitations to new members',
		category: 'Members',
	},
	{
		key: PERMISSIONS.MEMBER.MANAGE,
		name: 'Manage Members',
		description: "Update members' roles",
		category: 'Members',
	},
	{
		key: PERMISSIONS.MEMBER.REMOVE,
		name: 'Remove Members',
		description: 'Remove members from the workspace',
		category: 'Members',
	},

	// Role permissions
	{
		key: PERMISSIONS.ROLE.VIEW,
		name: 'View Roles',
		description: 'View roles and their permissions',
		category: 'Roles',
	},
	{
		key: PERMISSIONS.ROLE.CREATE,
		name: 'Create Roles',
		description: 'Create new custom roles',
		category: 'Roles',
	},
	{
		key: PERMISSIONS.ROLE.UPDATE,
		name: 'Update Roles',
		description: 'Update role permissions and settings',
		category: 'Roles',
	},
	{
		key: PERMISSIONS.ROLE.DELETE,
		name: 'Delete Roles',
		description: 'Delete custom roles',
		category: 'Roles',
	},

	// Content permissions
	{
		key: PERMISSIONS.CONTENT.VIEW,
		name: 'View Content',
		description: 'View workspace content',
		category: 'Content',
	},
	{
		key: PERMISSIONS.CONTENT.CREATE,
		name: 'Create Content',
		description: 'Create new content',
		category: 'Content',
	},
	{
		key: PERMISSIONS.CONTENT.UPDATE,
		name: 'Update Content',
		description: 'Edit existing content',
		category: 'Content',
	},
	{
		key: PERMISSIONS.CONTENT.DELETE,
		name: 'Delete Content',
		description: 'Delete content',
		category: 'Content',
	},

	// Settings permissions
	{
		key: PERMISSIONS.SETTINGS.VIEW,
		name: 'View Settings',
		description: 'View workspace settings',
		category: 'Settings',
	},
	{
		key: PERMISSIONS.SETTINGS.UPDATE,
		name: 'Update Settings',
		description: 'Update workspace settings',
		category: 'Settings',
	},
]

/**
 * Get permission definition by key
 */
export function getPermissionDefinition(
	key: string
): PermissionDefinition | undefined {
	return PERMISSION_DEFINITIONS.find((p) => p.key === key)
}

/**
 * Get all permissions grouped by category
 */
export function getPermissionsByCategory(): Record<
	string,
	PermissionDefinition[]
> {
	return PERMISSION_DEFINITIONS.reduce(
		(acc, permission) => {
			if (!acc[permission.category]) {
				acc[permission.category] = []
			}
			acc[permission.category].push(permission)
			return acc
		},
		{} as Record<string, PermissionDefinition[]>
	)
}
