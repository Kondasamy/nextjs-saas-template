'use client'

import { useSession, useUser } from '@/lib/auth/client'

export function useAuth() {
	const { data: session, isPending } = useSession()
	const { data: user } = useUser()

	return {
		user: user ?? null,
		session: session ?? null,
		isLoading: isPending,
		isAuthenticated: !!user,
	}
}

