import { requireAuth } from '@/lib/auth/auth-helpers'
import { AppSidebar } from '@/components/app-sidebar'
import PageHeader from '@/components/page-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await requireAuth()

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<PageHeader />
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

