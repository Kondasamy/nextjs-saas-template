import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ArchivedWorkspacesList } from '@/components/workspace/archived-workspaces-list'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function ArchivedWorkspacesPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Archived Workspaces</h1>
				<p className="text-muted-foreground">
					View and restore workspaces you've archived
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Your Archived Workspaces</CardTitle>
					<CardDescription>
						These workspaces are hidden from your workspace switcher. You can
						unarchive them to restore access.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ArchivedWorkspacesList />
				</CardContent>
			</Card>
		</div>
	)
}
