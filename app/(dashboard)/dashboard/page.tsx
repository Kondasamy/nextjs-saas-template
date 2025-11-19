import { requireAuth } from '@/lib/auth/auth-helpers'
import { createServerCaller } from '@/lib/trpc/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Workspaces</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{user?.organizations?.length ?? 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Active workspaces
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

