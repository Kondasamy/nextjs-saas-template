'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'

/**
 * Hook for realtime notifications
 * In production, this would connect to Supabase Realtime
 * For now, it polls for new notifications
 */
export function useRealtimeNotifications() {
	const [lastCheck, setLastCheck] = useState(new Date())
	const utils = trpc.useUtils()

	const { data: notifications } = trpc.notifications.list.useQuery(
		{
			limit: 10,
			unreadOnly: true,
		},
		{
			refetchInterval: 30000, // Poll every 30 seconds
		}
	)

	// Check for new notifications
	useEffect(() => {
		if (!notifications) return

		const newNotifications = notifications.notifications.filter(
			(n) => new Date(n.createdAt) > lastCheck
		)

		newNotifications.forEach((notification) => {
			toast(notification.title || 'New notification', {
				description: notification.message,
			})
		})

		if (newNotifications.length > 0) {
			setLastCheck(new Date())
		}
	}, [notifications, lastCheck])

	return {
		notifications: notifications?.notifications || [],
		unreadCount: notifications?.unreadCount || 0,
		refresh: () => utils.notifications.list.invalidate(),
	}
}
