import { Activity, Bell, Building2, Users } from 'lucide-react'
import { ActivityFeed } from '@/components/analytics/activity-feed'
import { StatsCard } from '@/components/analytics/stats-card'
import { UserGrowthChart } from '@/components/analytics/user-growth-chart'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { createServerCaller } from '@/lib/trpc/server'

export default async function DashboardPage() {
	await requireAuth()
	const caller = await createServerCaller()

	// Fetch all data in parallel
	const [user, stats, userGrowth, activities] = await Promise.all([
		caller.user.getCurrent(),
		caller.analytics.getStats(),
		caller.analytics.getUserGrowth({ days: 30 }),
		caller.analytics.getRecentActivities({ limit: 10 }),
	])

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user?.name ?? user?.email}
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Workspaces"
					value={stats.organizations}
					description="Active workspaces"
					icon={Building2}
				/>
				<StatsCard
					title="Team Members"
					value={stats.totalMembers}
					description="Across all workspaces"
					icon={Users}
				/>
				<StatsCard
					title="Recent Activity"
					value={stats.recentActivity}
					description="Last 7 days"
					icon={Activity}
				/>
				<StatsCard
					title="Notifications"
					value={stats.unreadNotifications}
					description="Unread messages"
					icon={Bell}
				/>
			</div>

			{/* Charts and Activity Feed */}
			<div className="grid gap-4 md:grid-cols-2">
				<UserGrowthChart data={userGrowth} />
				<ActivityFeed activities={activities} />
			</div>
		</div>
	)
}
