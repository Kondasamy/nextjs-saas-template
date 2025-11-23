'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook for Supabase Realtime subscriptions
 *
 * This hook is ready for production use with Supabase Realtime.
 * It provides a simple interface for subscribing to realtime events.
 *
 * Prerequisites:
 * 1. Set up Supabase environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 2. Configure Supabase Realtime in your Supabase dashboard
 *
 * @example
 * ```tsx
 * // Listen for new notifications
 * const { isConnected } = useRealtime<Notification>(
 *   'notifications',
 *   'new-notification',
 *   (notification) => {
 *     toast.success(notification.title)
 *   }
 * )
 *
 * // Listen for user presence updates
 * const { isConnected } = useRealtime<PresenceState>(
 *   'workspace:123',
 *   'presence',
 *   (state) => {
 *     console.log('Online users:', state.onlineUsers)
 *   }
 * )
 * ```
 *
 * Common use cases:
 * - Real-time notifications
 * - User presence tracking
 * - Collaborative editing
 * - Live chat
 * - Activity feeds
 */
export function useRealtime<T = unknown>(
	channel: string,
	event: string,
	callback: (payload: T) => void
) {
	const [isConnected, setIsConnected] = useState(false)
	const supabase = createClient()

	useEffect(() => {
		const realtimeChannel: RealtimeChannel = supabase
			.channel(channel)
			.on('broadcast', { event }, (payload) => {
				callback(payload.payload as T)
			})
			.subscribe((status) => {
				setIsConnected(status === 'SUBSCRIBED')
			})

		return () => {
			supabase.removeChannel(realtimeChannel)
		}
	}, [channel, event, callback, supabase])

	return { isConnected }
}
