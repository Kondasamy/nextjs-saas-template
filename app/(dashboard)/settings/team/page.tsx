import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function TeamSettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Team Settings</h1>
				<p className="text-muted-foreground">
					Manage your team members and roles
				</p>
			</div>
		</div>
	)
}
