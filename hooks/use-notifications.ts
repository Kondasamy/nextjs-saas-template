'use client'

import { trpc } from '@/lib/trpc/client'

export function useNotifications() {
	const { data, isLoading } = trpc.notifications.list.useQuery({
		read: false,
		limit: 50,
	})

	return {
		notifications: data?.notifications ?? [],
		isLoading,
		unreadCount: data?.notifications?.length ?? 0,
	}
}
