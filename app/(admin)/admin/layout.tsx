import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function AdminLayout({
	children,
}: {
	children: ReactNode
}) {
	await requireAdmin()

	return (
		<div className="space-y-6">
			<Alert>
				<Shield className="h-4 w-4" />
				<AlertTitle>Admin Mode</AlertTitle>
				<AlertDescription>
					You are viewing the admin dashboard. Be careful with any actions you
					take here.
				</AlertDescription>
			</Alert>
			{children}
		</div>
	)
}
