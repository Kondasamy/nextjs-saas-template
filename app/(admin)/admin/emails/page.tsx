import { Mail, Send } from 'lucide-react'
import { EmailTemplatesManager } from '@/components/admin/email-templates-manager'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/admin-helpers'

export default async function EmailTemplatesPage() {
	await requireAdmin()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Mail className="h-8 w-8" />
					Email Templates
				</h1>
				<p className="text-muted-foreground">
					Manage and preview email templates sent to users
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5" />
							Available Templates
						</CardTitle>
						<CardDescription>
							6 React Email templates integrated with Better Auth
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">Welcome Email</span> - Sent after
								signup
							</li>
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">Verification Email</span> - Email
								verification
							</li>
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">Password Reset</span> - Password
								recovery
							</li>
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">Magic Link</span> - Passwordless
								login
							</li>
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">Team Invitation</span> - Workspace
								invites
							</li>
							<li className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium">2FA Code</span> - Two-factor
								authentication
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Send className="h-5 w-5" />
							Email Configuration
						</CardTitle>
						<CardDescription>
							Email sending is handled by Resend
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<div>
							<span className="font-medium">Provider:</span> Resend
						</div>
						<div>
							<span className="font-medium">Status:</span>{' '}
							{process.env.RESEND_API_KEY ? (
								<span className="text-green-600">✓ Configured</span>
							) : (
								<span className="text-amber-600">⚠ Not configured</span>
							)}
						</div>
						<div>
							<span className="font-medium">From Address:</span>{' '}
							{process.env.EMAIL_FROM_ADDRESS || 'Not set'}
						</div>
						<div className="pt-2 text-xs text-muted-foreground">
							Configure RESEND_API_KEY in your environment variables to enable
							email sending.
						</div>
					</CardContent>
				</Card>
			</div>

			<EmailTemplatesManager />
		</div>
	)
}
