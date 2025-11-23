import { ImpersonationBanner } from '@/components/admin/impersonation-banner'
import { AppSidebar } from '@/components/app-sidebar'
import { MaintenanceBannerWrapper } from '@/components/maintenance-banner-wrapper'
import PageHeader from '@/components/page-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { getImpersonationSession } from '@/lib/auth/impersonation'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const _session = await requireAuth()

	// Check for active impersonation session
	const impersonationSession = await getImpersonationSession()

	// Get user emails for impersonation banner
	let impersonationData: {
		targetUserEmail: string
		adminEmail: string
	} | null = null

	if (impersonationSession) {
		const [targetUser, adminUser] = await Promise.all([
			prisma.user.findUnique({
				where: { id: impersonationSession.userId },
				select: { email: true },
			}),
			prisma.user.findUnique({
				where: { id: impersonationSession.adminId },
				select: { email: true },
			}),
		])

		if (targetUser && adminUser) {
			impersonationData = {
				targetUserEmail: targetUser.email,
				adminEmail: adminUser.email,
			}
		}
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<PageHeader />
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<MaintenanceBannerWrapper />
					{impersonationData && (
						<ImpersonationBanner
							targetUserEmail={impersonationData.targetUserEmail}
							adminEmail={impersonationData.adminEmail}
						/>
					)}
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
