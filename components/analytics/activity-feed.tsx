'use client'

import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Activity {
	id: string
	action: string
	userId: string
	createdAt: Date
	user: {
		name: string | null
		email: string
		image: string | null
	}
}

interface ActivityFeedProps {
	activities: Activity[]
}

function getActionDescription(action: string): string {
	const descriptions: Record<string, string> = {
		'user.login': 'logged in',
		'user.logout': 'logged out',
		'user.signup': 'signed up',
		'user.update': 'updated their profile',
		'workspace.create': 'created a workspace',
		'workspace.update': 'updated workspace settings',
		'workspace.delete': 'deleted a workspace',
		'member.invite': 'invited a new member',
		'member.join': 'joined the workspace',
		'member.remove': 'removed a member',
		'member.leave': 'left the workspace',
		'role.update': 'updated member roles',
	}

	return descriptions[action] || action
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Latest actions in your workspaces</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] pr-4">
					<div className="space-y-4">
						{activities.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No recent activity
							</p>
						) : (
							activities.map((activity) => (
								<div key={activity.id} className="flex items-start space-x-4">
									<Avatar className="h-8 w-8">
										<AvatarImage src={activity.user.image || undefined} />
										<AvatarFallback>
											{activity.user.name?.[0]?.toUpperCase() ||
												activity.user.email[0]?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 space-y-1">
										<p className="text-sm">
											<span className="font-medium">
												{activity.user.name || activity.user.email}
											</span>{' '}
											{getActionDescription(activity.action)}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDistanceToNow(new Date(activity.createdAt), {
												addSuffix: true,
											})}
										</p>
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
