import { ProfileSettingsForm } from '@/components/settings/profile-settings-form'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function ProfileSettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Profile Settings</h1>
				<p className="text-muted-foreground">Manage your profile information</p>
			</div>
			<ProfileSettingsForm />
		</div>
	)
}
