import { Activity, Building2, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { StatsCard } from '@/components/analytics/stats-card'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { createServerCaller } from '@/lib/trpc/server'

export default async function AdminDashboardPage() {
	await requireAdmin()
	const caller = await createServerCaller()

	const stats = await caller.admin.getSystemStats()

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						System overview and management
					</p>
				</div>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href="/admin/users">Manage Users</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/admin/audit">View Audit Logs</Link>
					</Button>
				</div>
			</div>

			{/* System Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total Users"
					value={stats.totalUsers}
					description="Registered accounts"
					icon={Users}
				/>
				<StatsCard
					title="Organizations"
					value={stats.totalOrganizations}
					description="Active workspaces"
					icon={Building2}
				/>
				<StatsCard
					title="New Users"
					value={stats.recentUsers}
					description="Last 30 days"
					icon={TrendingUp}
				/>
				<StatsCard
					title="Active Users"
					value={stats.activeUsers}
					description="Last 7 days"
					icon={Activity}
				/>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2">
				<Link
					href="/admin/users"
					className="rounded-lg border p-6 transition-colors hover:border-primary"
				>
					<h3 className="mb-2 text-lg font-semibold">User Management</h3>
					<p className="text-sm text-muted-foreground">
						View, search, and manage all user accounts
					</p>
				</Link>
				<Link
					href="/admin/audit"
					className="rounded-lg border p-6 transition-colors hover:border-primary"
				>
					<h3 className="mb-2 text-lg font-semibold">Audit Logs</h3>
					<p className="text-sm text-muted-foreground">
						Track all system activity and changes
					</p>
				</Link>
			</div>
		</div>
	)
}
