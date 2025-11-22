import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ArchiveWorkspaceDialog } from '@/components/workspace/archive-workspace-dialog'
import { CloneWorkspaceDialog } from '@/components/workspace/clone-workspace-dialog'
import { UsageDashboard } from '@/components/workspace/usage-dashboard'
import { WorkspaceLogoUpload } from '@/components/workspace/workspace-logo-upload'
import { WorkspaceSettings } from '@/components/workspace/workspace-settings'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function WorkspaceSettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Workspace Settings</h1>
				<p className="text-muted-foreground">
					Manage your workspace details and branding
				</p>
			</div>

			<UsageDashboard />

			<Card>
				<CardHeader>
					<CardTitle>Workspace Logo</CardTitle>
					<CardDescription>
						Upload a logo for your workspace. This will be displayed in the
						workspace switcher.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<WorkspaceLogoUpload />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
					<CardDescription>
						Update your workspace name and description
					</CardDescription>
				</CardHeader>
				<CardContent>
					<WorkspaceSettings />
				</CardContent>
			</Card>

			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
					<CardDescription>
						Advanced actions that can affect your workspace
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-1">
							<h3 className="text-sm font-medium">Clone this workspace</h3>
							<p className="text-sm text-muted-foreground">
								Create a copy with all roles and settings. Members will not be
								copied.
							</p>
						</div>
						<CloneWorkspaceDialog />
					</div>

					<div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
						<div className="space-y-1">
							<h3 className="text-sm font-medium text-destructive">
								Archive this workspace
							</h3>
							<p className="text-sm text-muted-foreground">
								Hide this workspace from your workspace switcher. You can
								restore it later.
							</p>
						</div>
						<ArchiveWorkspaceDialog />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
