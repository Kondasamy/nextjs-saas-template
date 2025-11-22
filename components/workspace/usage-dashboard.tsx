'use client'

import { formatDistanceToNow } from 'date-fns'
import { Activity, Link2, Mail, TrendingUp, Users } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function UsageDashboard() {
	const { currentWorkspace } = useWorkspace()

	const { data, isLoading } = trpc.workspace.getWorkspaceUsage.useQuery(
		{ organizationId: currentWorkspace?.id ?? '' },
		{ enabled: !!currentWorkspace }
	)

	if (!currentWorkspace) {
		return null
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Workspace Usage</CardTitle>
					<CardDescription>Loading metrics...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8 text-muted-foreground">
						<Activity className="mr-2 h-4 w-4 animate-pulse" />
						Loading...
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data) {
		return null
	}

	const metrics = [
		{
			label: 'Total Members',
			value: data.metrics.memberCount,
			icon: Users,
			color: 'text-blue-500',
			bgColor: 'bg-blue-500/10',
		},
		{
			label: 'Active Members (30d)',
			value: data.metrics.activeMembersCount,
			icon: TrendingUp,
			color: 'text-green-500',
			bgColor: 'bg-green-500/10',
			subtitle: `${data.metrics.activePercentage}% of total`,
		},
		{
			label: 'Pending Invitations',
			value: data.metrics.pendingInvitationsCount,
			icon: Mail,
			color: 'text-orange-500',
			bgColor: 'bg-orange-500/10',
		},
		{
			label: 'Active Invite Links',
			value: data.metrics.activeInviteLinksCount,
			icon: Link2,
			color: 'text-purple-500',
			bgColor: 'bg-purple-500/10',
		},
		{
			label: 'Recent Activities',
			value: data.metrics.recentActivityCount,
			icon: Activity,
			color: 'text-pink-500',
			bgColor: 'bg-pink-500/10',
			subtitle: 'Last 30 days',
		},
	]

	return (
		<Card>
			<CardHeader>
				<CardTitle>Workspace Usage & Limits</CardTitle>
				<CardDescription>
					Overview of your workspace activity and member engagement
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Workspace Info */}
				<div className="rounded-lg border bg-muted/50 p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Workspace
							</p>
							<p className="text-lg font-semibold">{data.workspace.name}</p>
						</div>
						<div className="text-right">
							<p className="text-sm font-medium text-muted-foreground">
								Created
							</p>
							<p className="text-sm">
								{formatDistanceToNow(new Date(data.workspace.createdAt), {
									addSuffix: true,
								})}
							</p>
						</div>
					</div>
				</div>

				{/* Metrics Grid */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{metrics.map((metric, index) => (
						<div
							key={index}
							className="flex items-start gap-3 rounded-lg border p-4"
						>
							<div className={`rounded-lg ${metric.bgColor} p-2.5`}>
								<metric.icon className={`h-5 w-5 ${metric.color}`} />
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium text-muted-foreground">
									{metric.label}
								</p>
								<p className="text-2xl font-bold">{metric.value}</p>
								{metric.subtitle && (
									<p className="text-xs text-muted-foreground mt-1">
										{metric.subtitle}
									</p>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Activity Percentage */}
				{data.metrics.memberCount > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Member Activity Rate</span>
							<span className="text-muted-foreground">
								{data.metrics.activePercentage}%
							</span>
						</div>
						<Progress value={data.metrics.activePercentage} className="h-2" />
						<p className="text-xs text-muted-foreground">
							{data.metrics.activeMembersCount} out of{' '}
							{data.metrics.memberCount} members were active in the last 30 days
						</p>
					</div>
				)}

				{/* Info Box */}
				<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
					<p className="text-sm text-muted-foreground">
						<strong>Note:</strong> Activity metrics are calculated based on the
						last 30 days. Active members are those who have logged in during
						this period.
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
