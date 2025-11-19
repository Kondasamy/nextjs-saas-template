'use client'

import { useSession } from '@/lib/auth/client'

export function useSessionData() {
	const { data: session, isPending } = useSession()

	return {
		session: session ?? null,
		isLoading: isPending,
	}
}

