import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { RolesTable } from '@/components/workspace/roles-table'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function WorkspaceRolesPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Roles & Permissions</h1>
				<p className="text-muted-foreground">
					Manage roles and their permissions in your workspace
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Workspace Roles</CardTitle>
					<CardDescription>
						Create and manage custom roles with specific permissions for your
						team members
					</CardDescription>
				</CardHeader>
				<CardContent>
					<RolesTable />
				</CardContent>
			</Card>
		</div>
	)
}
