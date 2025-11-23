import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { MaintenanceBannerWrapper } from '@/components/maintenance-banner-wrapper'
import PageHeader from '@/components/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function AdminLayout({
	children,
}: {
	children: ReactNode
}) {
	await requireAdmin()

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<PageHeader />
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<MaintenanceBannerWrapper />
					<Alert variant="warning">
						<Shield className="h-4 w-4" />
						<AlertTitle>Admin Mode</AlertTitle>
						<AlertDescription>
							You are viewing the admin dashboard. Be careful with any actions
							you take here.
						</AlertDescription>
					</Alert>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
