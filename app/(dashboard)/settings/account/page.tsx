import { ActivityLog } from '@/components/settings/activity-log'
import { DeleteAccountForm } from '@/components/settings/delete-account-form'
import { EmailChangeForm } from '@/components/settings/email-change-form'
import { ExportAccountData } from '@/components/settings/export-account-data'
import { PasswordChangeForm } from '@/components/settings/password-change-form'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { createServerCaller } from '@/lib/trpc/server'

export default async function AccountSettingsPage() {
	await requireAuth()
	const caller = await createServerCaller()
	const user = await caller.user.getCurrent()

	if (!user) {
		return null
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Account Settings</h1>
				<p className="text-muted-foreground">
					Manage your account credentials and preferences
				</p>
			</div>

			<div className="grid gap-6">
				<EmailChangeForm currentEmail={user.email} />
				<PasswordChangeForm />
				<ExportAccountData />
				<ActivityLog />
				<DeleteAccountForm />
			</div>
		</div>
	)
}
