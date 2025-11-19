import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function NotificationSettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Notification Settings</h1>
				<p className="text-muted-foreground">
					Manage your notification preferences
				</p>
			</div>
		</div>
	)
}

