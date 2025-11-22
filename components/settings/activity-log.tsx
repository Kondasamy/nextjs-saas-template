'use client'

import { formatDistanceToNow } from 'date-fns'
import { Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'

// Action type labels for better UX
const ACTION_LABELS: Record<string, string> = {
	'2fa_enabled': 'Enabled Two-Factor Authentication',
	'2fa_disabled': 'Disabled Two-Factor Authentication',
	passkey_added: 'Added Passkey',
	passkey_removed: 'Removed Passkey',
	passkey_renamed: 'Renamed Passkey',
	password_changed: 'Changed Password',
	email_change_requested: 'Requested Email Change',
	email_changed: 'Changed Email',
	session_revoked: 'Revoked Session',
	all_sessions_revoked: 'Revoked All Sessions',
	workspace_joined: 'Joined Workspace',
	workspace_created: 'Created Workspace',
	workspace_updated: 'Updated Workspace',
	member_role_updated: 'Updated Member Role',
	member_removed: 'Removed Member',
	invite_link_created: 'Created Invite Link',
	invite_link_revoked: 'Revoked Invite Link',
	bulk_members_invited: 'Bulk Invited Members',
	bulk_members_role_updated: 'Bulk Updated Member Roles',
	bulk_members_removed: 'Bulk Removed Members',
	account_data_exported: 'Exported Account Data',
}

interface ActivityLogProps {
	showTitle?: boolean
	limit?: number
}

export function ActivityLog({
	showTitle = true,
	limit = 10,
}: ActivityLogProps) {
	const [offset, setOffset] = useState(0)
	const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

	const { data, isLoading } = trpc.user.getUserActivityLog.useQuery({
		limit,
		offset,
	})

	const toggleExpand = (logId: string) => {
		const newExpanded = new Set(expandedLogs)
		if (newExpanded.has(logId)) {
			newExpanded.delete(logId)
		} else {
			newExpanded.add(logId)
		}
		setExpandedLogs(newExpanded)
	}

	const handleLoadMore = () => {
		setOffset((prev) => prev + limit)
	}

	const handleLoadPrevious = () => {
		setOffset((prev) => Math.max(0, prev - limit))
	}

	if (isLoading && offset === 0) {
		return (
			<Card>
				{showTitle && (
					<CardHeader>
						<CardTitle>Account Activity</CardTitle>
						<CardDescription>Recent activity on your account</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="flex items-center justify-center py-8 text-muted-foreground">
						<Activity className="mr-2 h-4 w-4 animate-pulse" />
						Loading activity...
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			{showTitle && (
				<CardHeader>
					<CardTitle>Account Activity</CardTitle>
					<CardDescription>Recent activity on your account</CardDescription>
				</CardHeader>
			)}
			<CardContent className="space-y-4">
				{!data || data.logs.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<Activity className="mb-2 h-8 w-8" />
						<p>No activity recorded yet</p>
					</div>
				) : (
					<div className="space-y-3">
						{data.logs.map((log) => {
							const isExpanded = expandedLogs.has(log.id)
							const hasMetadata =
								log.metadata && Object.keys(log.metadata as object).length > 0

							return (
								<div
									key={log.id}
									className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
								>
									<div className="mt-1 rounded-full bg-primary/10 p-1.5">
										<Activity className="h-3 w-3 text-primary" />
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-medium">
												{ACTION_LABELS[log.action] || log.action}
											</p>
											<span className="text-xs text-muted-foreground whitespace-nowrap">
												{formatDistanceToNow(new Date(log.createdAt), {
													addSuffix: true,
												})}
											</span>
										</div>

										{log.ipAddress && (
											<p className="text-xs text-muted-foreground">
												IP: {log.ipAddress}
											</p>
										)}

										{hasMetadata && (
											<>
												{!isExpanded && (
													<button
														type="button"
														onClick={() => toggleExpand(log.id)}
														className="text-xs text-primary hover:underline flex items-center gap-1"
													>
														Show details
														<ChevronDown className="h-3 w-3" />
													</button>
												)}

												{isExpanded && (
													<div className="mt-2 space-y-2">
														<button
															type="button"
															onClick={() => toggleExpand(log.id)}
															className="text-xs text-primary hover:underline flex items-center gap-1"
														>
															Hide details
															<ChevronUp className="h-3 w-3" />
														</button>
														<div className="rounded-md bg-muted p-2">
															<pre className="text-xs overflow-x-auto">
																{JSON.stringify(log.metadata, null, 2)}
															</pre>
														</div>
													</div>
												)}
											</>
										)}
									</div>
								</div>
							)
						})}
					</div>
				)}

				{data && data.total > limit && (
					<div className="flex items-center justify-between border-t pt-4">
						<div className="text-xs text-muted-foreground">
							Showing {offset + 1} - {Math.min(offset + limit, data.total)} of{' '}
							{data.total} activities
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleLoadPrevious}
								disabled={offset === 0}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleLoadMore}
								disabled={!data.hasMore}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
