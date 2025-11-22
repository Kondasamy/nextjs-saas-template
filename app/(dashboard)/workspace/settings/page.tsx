import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
		</div>
	)
}
