'use client'

import { useEffect, useState } from 'react'

interface PresenceUser {
	id: string
	name: string
	email: string
	image?: string | null
	lastSeen: Date
}

/**
 * Hook for tracking online users (presence)
 * In production, this would use Supabase Realtime Presence
 *
 * NOTE: This is a placeholder implementation kept for future use.
 * Currently unused but ready for integration when Supabase Realtime is configured.
 *
 * @unused-export - Intentionally kept for future implementation
 */
export function usePresence(workspaceId?: string) {
	const [onlineUsers, _setOnlineUsers] = useState<PresenceUser[]>([])

	useEffect(() => {
		if (!workspaceId) return

		// TODO: Implement with Supabase Realtime Presence
		// const channel = supabase.channel(`workspace:${workspaceId}`)
		//   .on('presence', { event: 'sync' }, () => {
		//     const state = channel.presenceState()
		//     setOnlineUsers(Object.values(state))
		//   })
		//   .subscribe(async (status) => {
		//     if (status === 'SUBSCRIBED') {
		//       await channel.track({ user_id: userId, online_at: new Date() })
		//     }
		//   })

		// return () => {
		//   supabase.removeChannel(channel)
		// }
	}, [workspaceId])

	return {
		onlineUsers,
		onlineCount: onlineUsers.length,
	}
}
