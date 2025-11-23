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
	userId: string | null
	createdAt: Date
	user: {
		name: string | null
		email: string
		image: string | null
	} | null
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

// Type guard to filter activities with users
function hasUser(
	activity: Activity
): activity is Activity & { user: NonNullable<Activity['user']> } {
	return activity.user !== null
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	// Filter out activities without users (they can't be displayed)
	const activitiesWithUsers = activities.filter(hasUser)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Latest actions in your workspaces</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] pr-4">
					<div className="space-y-4">
						{activitiesWithUsers.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No recent activity
							</p>
						) : (
							activitiesWithUsers.map((activity) => {
								// TypeScript now knows user is not null after type guard
								const user = activity.user
								return (
									<div key={activity.id} className="flex items-start space-x-4">
										<Avatar className="h-8 w-8">
											<AvatarImage src={user.image || undefined} />
											<AvatarFallback>
												{user.name?.[0]?.toUpperCase() ||
													user.email[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 space-y-1">
											<p className="text-sm">
												<span className="font-medium">
													{user.name || user.email}
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
								)
							})
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
