'use client'

import { useRealtime } from './use-realtime'
import { useNotifications } from './use-notifications'
import { trpc } from '@/lib/trpc/client'

export function useRealtimeNotifications() {
	const { notifications, unreadCount } = useNotifications()
	const utils = trpc.useUtils()

	useRealtime('notifications', 'new-notification', () => {
		// Refetch notifications when a new one arrives
		utils.notifications.list.invalidate()
	})

	return {
		notifications,
		unreadCount,
	}
}

