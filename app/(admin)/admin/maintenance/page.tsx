import { Suspense } from 'react'
import { MaintenanceManager } from '@/components/admin/maintenance-manager'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { createServerCaller } from '@/lib/trpc/server'

export const metadata = {
	title: 'Maintenance Mode',
	description: 'Manage system maintenance mode and banners',
}

export default async function MaintenancePage() {
	await requireAdmin()
	const caller = await createServerCaller()

	const status = await caller.maintenance.getStatus()

	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Maintenance Mode</h1>
				<p className="text-muted-foreground">
					Control system-wide maintenance banners and notifications
				</p>
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				<MaintenanceManager initialStatus={status} />
			</Suspense>
		</div>
	)
}
