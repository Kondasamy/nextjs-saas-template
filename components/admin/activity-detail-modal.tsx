'use client'

import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface AuditLog {
	id: string
	action: string
	resource: string | null
	resourceId: string | null
	metadata: unknown
	ipAddress: string | null
	userAgent: string | null
	createdAt: Date
	organizationId: string | null
	user?: {
		name: string | null
		email: string
		image: string | null
	} | null
	organization?: {
		id: string
		name: string
		slug: string
	} | null
}

interface ActivityDetailModalProps {
	activity: AuditLog | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

const ACTION_COLORS: Record<string, string> = {
	'user.login': 'default',
	'user.logout': 'secondary',
	'user.signup': 'default',
	'workspace.create': 'default',
	'workspace.delete': 'destructive',
	'member.invite': 'default',
	'member.remove': 'destructive',
}

export function ActivityDetailModal({
	activity,
	open,
	onOpenChange,
}: ActivityDetailModalProps) {
	if (!activity) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Activity Details</DialogTitle>
					<DialogDescription>
						Detailed information about this audit log entry
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* User Information */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">User</h3>
						{activity.user ? (
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10">
									<AvatarImage src={activity.user.image || undefined} />
									<AvatarFallback>
										{activity.user.name?.[0]?.toUpperCase() ||
											activity.user.email[0]?.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="font-medium">
										{activity.user.name || activity.user.email}
									</span>
									<span className="text-sm text-muted-foreground">
										{activity.user.email}
									</span>
								</div>
							</div>
						) : (
							<span className="text-sm text-muted-foreground">
								Unknown User
							</span>
						)}
					</div>

					<Separator />

					{/* Action Information */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">Action</h3>
						<Badge
							variant={(ACTION_COLORS[activity.action] as any) || 'default'}
						>
							{activity.action}
						</Badge>
					</div>

					<Separator />

					{/* Resource Information */}
					{(activity.resource || activity.resourceId) && (
						<>
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Resource</h3>
								<div className="grid grid-cols-2 gap-4">
									{activity.resource && (
										<div>
											<p className="text-xs text-muted-foreground">Type</p>
											<p className="text-sm font-mono">{activity.resource}</p>
										</div>
									)}
									{activity.resourceId && (
										<div>
											<p className="text-xs text-muted-foreground">ID</p>
											<p className="text-sm font-mono">{activity.resourceId}</p>
										</div>
									)}
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Metadata */}
					{activity.metadata && (
						<>
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Metadata</h3>
								<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
									{JSON.stringify(activity.metadata, null, 2)}
								</pre>
							</div>
							<Separator />
						</>
					)}

					{/* Organization */}
					{activity.organization && (
						<>
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Organization</h3>
								<div className="space-y-1">
									<p className="text-sm font-medium">
										{activity.organization.name}
									</p>
									<p className="text-xs text-muted-foreground font-mono">
										{activity.organization.slug}
									</p>
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Technical Details */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">Technical Details</h3>
						<div className="grid grid-cols-1 gap-4">
							<div>
								<p className="text-xs text-muted-foreground">Timestamp</p>
								<p className="text-sm">
									{format(new Date(activity.createdAt), 'PPpp')}
								</p>
							</div>
							{activity.ipAddress && (
								<div>
									<p className="text-xs text-muted-foreground">IP Address</p>
									<p className="text-sm font-mono">{activity.ipAddress}</p>
								</div>
							)}
							{activity.userAgent && (
								<div>
									<p className="text-xs text-muted-foreground">User Agent</p>
									<p className="text-sm font-mono break-all">
										{activity.userAgent}
									</p>
								</div>
							)}
							<div>
								<p className="text-xs text-muted-foreground">Log ID</p>
								<p className="text-sm font-mono">{activity.id}</p>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
