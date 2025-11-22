'use client'

import { formatDistanceToNow } from 'date-fns'
import { Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'

function getDeviceIcon(userAgent: string) {
	const ua = userAgent.toLowerCase()
	if (
		ua.includes('mobile') ||
		ua.includes('android') ||
		ua.includes('iphone')
	) {
		return <Smartphone className="h-4 w-4" />
	}
	if (ua.includes('tablet') || ua.includes('ipad')) {
		return <Tablet className="h-4 w-4" />
	}
	return <Monitor className="h-4 w-4" />
}

function parseUserAgent(userAgent: string): {
	browser: string
	os: string
} {
	// Simple user agent parsing
	let browser = 'Unknown Browser'
	let os = 'Unknown OS'

	// Browser detection
	if (userAgent.includes('Chrome')) browser = 'Chrome'
	else if (userAgent.includes('Firefox')) browser = 'Firefox'
	else if (userAgent.includes('Safari')) browser = 'Safari'
	else if (userAgent.includes('Edge')) browser = 'Edge'
	else if (userAgent.includes('Opera')) browser = 'Opera'

	// OS detection
	if (userAgent.includes('Windows')) os = 'Windows'
	else if (userAgent.includes('Mac OS')) os = 'macOS'
	else if (userAgent.includes('Linux')) os = 'Linux'
	else if (userAgent.includes('Android')) os = 'Android'
	else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS'

	return { browser, os }
}

export function ActiveSessionsTable() {
	const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
		null
	)

	const { data: sessions = [], refetch } = trpc.user.listSessions.useQuery()

	const revokeSession = trpc.user.revokeSession.useMutation({
		onSuccess: () => {
			toast.success('Session revoked successfully')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to revoke session')
		},
		onSettled: () => {
			setRevokingSessionId(null)
		},
	})

	const revokeAllSessions = trpc.user.revokeAllSessions.useMutation({
		onSuccess: (data) => {
			toast.success(data.message)
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to revoke sessions')
		},
	})

	const handleRevokeSession = (sessionId: string) => {
		if (confirm('Are you sure you want to revoke this session?')) {
			setRevokingSessionId(sessionId)
			revokeSession.mutate({ sessionId })
		}
	}

	const handleRevokeAllSessions = () => {
		if (
			confirm(
				'Are you sure you want to revoke all other sessions? You will need to sign in again on those devices.'
			)
		) {
			revokeAllSessions.mutate()
		}
	}

	const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					You have {sessions.length} active session(s)
				</p>
				{otherSessionsCount > 0 && (
					<Button
						variant="destructive"
						size="sm"
						onClick={handleRevokeAllSessions}
						disabled={revokeAllSessions.isPending}
					>
						Revoke All Other Sessions
					</Button>
				)}
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Device</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Last Active</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sessions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-center text-muted-foreground"
								>
									No active sessions
								</TableCell>
							</TableRow>
						) : (
							sessions.map((session) => {
								const { browser, os } = parseUserAgent(session.userAgent)

								return (
									<TableRow key={session.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												{getDeviceIcon(session.userAgent)}
												<div className="flex flex-col">
													<span className="font-medium">
														{session.deviceName}
													</span>
													<span className="text-xs text-muted-foreground">
														{browser} on {os}
													</span>
													{session.isCurrent && (
														<span className="text-xs font-medium text-green-600 dark:text-green-400">
															Current Session
														</span>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{session.ipAddress}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{formatDistanceToNow(new Date(session.lastActiveAt), {
													addSuffix: true,
												})}
											</span>
										</TableCell>
										<TableCell className="text-right">
											{!session.isCurrent && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleRevokeSession(session.id)}
													disabled={
														revokingSessionId === session.id ||
														revokeSession.isPending
													}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											)}
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
