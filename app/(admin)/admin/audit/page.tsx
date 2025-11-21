import Link from 'next/link'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function AdminAuditPage() {
	await requireAdmin()

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Audit Logs</h1>
					<p className="text-muted-foreground">
						Track all system activity and user actions
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/admin">Back to Dashboard</Link>
				</Button>
			</div>

			<AuditLogTable />
		</div>
	)
}
