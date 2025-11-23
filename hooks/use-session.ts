'use client'

import { useSession } from '@/lib/auth/client'

/**
 * Hook to get current session data
 *
 * Note: For most use cases, prefer using `useAuth()` from '@/hooks/use-auth'
 * which provides both session and user data in one hook.
 *
 * This hook is useful when you only need session data without user details.
 *
 * @example
 * ```tsx
 * const { session, isLoading } = useSessionData()
 * ```
 */
export function useSessionData() {
	const { data: session, isPending } = useSession()

	return {
		session: session ?? null,
		isLoading: isPending,
	}
}
