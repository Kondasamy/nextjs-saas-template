'use client'

import { useMemo } from 'react'
import { useAuth } from './use-auth'

export function usePermissions(organizationId?: string) {
	const { user } = useAuth()

	// This would fetch the user's role and permissions for the current workspace
	// For now, returning empty array as placeholder
	const permissions = useMemo(() => {
		if (!user || !organizationId) {
			return []
		}

		// This would come from tRPC query
		// const { data } = trpc.permissions.getUserPermissions.useQuery({ organizationId })
		// return data?.permissions ?? []

		return []
	}, [user, organizationId])

	return {
		permissions,
		hasPermission: (permission: string) =>
			permissions.includes('*') || permissions.includes(permission),
	}
}
