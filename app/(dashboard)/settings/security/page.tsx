import { TwoFactorSetup } from '@/components/auth/2fa-setup'
import { DeviceList } from '@/components/auth/device-list'
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
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TwoFactorSetup />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions and devices
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DeviceList />
				</CardContent>
			</Card>
		</div>
	)
}
