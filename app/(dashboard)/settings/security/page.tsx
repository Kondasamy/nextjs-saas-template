import { ActiveSessionsTable } from '@/components/settings/active-sessions-table'
import { PasskeyList } from '@/components/settings/passkey-list'
import { TwoFactorSettings } from '@/components/settings/two-factor-settings'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function SecuritySettingsPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Security Settings</h1>
				<p className="text-muted-foreground">
					Manage your security preferences and active sessions
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions and devices. You can revoke any session
						to sign out from that device.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ActiveSessionsTable />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TwoFactorSettings />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Passkeys</CardTitle>
					<CardDescription>
						Sign in securely using biometrics, security keys, or your device's
						screen lock
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PasskeyList />
				</CardContent>
			</Card>
		</div>
	)
}
