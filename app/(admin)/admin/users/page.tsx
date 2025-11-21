import Link from 'next/link'
import { UsersTable } from '@/components/admin/users-table'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function AdminUsersPage() {
	await requireAdmin()

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">User Management</h1>
					<p className="text-muted-foreground">
						View and manage all registered users
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/admin">Back to Dashboard</Link>
				</Button>
			</div>

			<UsersTable />
		</div>
	)
}
