import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { APIKeysTable } from '@/components/workspace/api-keys-table'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function APIKeysPage() {
	await requireAuth()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">API Keys</h1>
				<p className="text-muted-foreground">
					Manage API keys for programmatic access to your workspace
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Workspace API Keys</CardTitle>
					<CardDescription>
						Create and manage API keys for accessing your workspace via API.
						Keys are shown only once upon creation.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<APIKeysTable />
				</CardContent>
			</Card>

			<Card className="border-amber-500/50 bg-amber-500/5">
				<CardHeader>
					<CardTitle className="text-amber-700 dark:text-amber-400">
						Security Notice
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm space-y-2 text-muted-foreground">
					<p>
						• API keys provide full access to your workspace. Keep them secure
						and never share them publicly.
					</p>
					<p>
						• Keys are displayed only once upon creation. Store them in a secure
						location.
					</p>
					<p>
						• If a key is compromised, revoke it immediately and create a new
						one.
					</p>
					<p>• Set expiration dates to limit the lifetime of keys.</p>
				</CardContent>
			</Card>
		</div>
	)
}
