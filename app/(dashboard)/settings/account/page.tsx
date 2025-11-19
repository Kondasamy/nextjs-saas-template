import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function AccountSettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Account Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings
				</p>
			</div>
		</div>
	)
}

