'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
