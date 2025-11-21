import { Activity, Bell, Building2, Users } from 'lucide-react'
import { Suspense } from 'react'
import { ActivityFeed } from '@/components/analytics/activity-feed'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { StatsCard } from '@/components/analytics/stats-card'
import { UserGrowthChart } from '@/components/analytics/user-growth-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { createServerCaller } from '@/lib/trpc/server'

async function DashboardStats() {
	const caller = await createServerCaller()
	const stats = await caller.analytics.getStats()

	return (
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
	)
}

async function DashboardCharts() {
	const caller = await createServerCaller()
	const [userGrowth, activities] = await Promise.all([
		caller.analytics.getUserGrowth({ days: 30 }),
		caller.analytics.getRecentActivities({ limit: 10 }),
	])

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<UserGrowthChart data={userGrowth} />
			<ActivityFeed activities={activities} />
		</div>
	)
}

function StatsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{[...Array(4)].map((_, i) => (
				<div key={i} className="rounded-lg border bg-card p-6">
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-16" />
				</div>
			))}
		</div>
	)
}

function ChartsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<div className="rounded-lg border bg-card p-6">
				<Skeleton className="h-6 w-32 mb-4" />
				<Skeleton className="h-[300px] w-full" />
			</div>
			<div className="rounded-lg border bg-card p-6">
				<Skeleton className="h-6 w-32 mb-4" />
				<Skeleton className="h-[300px] w-full" />
			</div>
		</div>
	)
}

export default async function DashboardPage() {
	await requireAuth()
	const caller = await createServerCaller()
	const user = await caller.user.getCurrent()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user?.name ?? user?.email}
				</p>
			</div>

			{/* Stats Cards with Suspense */}
			<Suspense fallback={<StatsSkeleton />}>
				<DashboardStats />
			</Suspense>

			{/* Revenue and Heatmap Charts */}
			<div className="grid gap-4 md:grid-cols-2">
				<RevenueChart />
				<ActivityHeatmap />
			</div>

			{/* User Growth and Activity Feed with Suspense */}
			<Suspense fallback={<ChartsSkeleton />}>
				<DashboardCharts />
			</Suspense>
		</div>
	)
}
