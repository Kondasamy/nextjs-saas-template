import { redirect } from 'next/navigation'
import { AcceptInvitation } from '@/components/invitations/accept-invitation'
import { auth } from '@/lib/auth/auth'
import { createServerCaller } from '@/lib/trpc/server'

interface InvitePageProps {
	params: Promise<{
		token: string
	}>
}

export default async function InvitePage({ params }: InvitePageProps) {
	const { token } = await params
	const session = await auth()

	// If not authenticated, redirect to login with redirect back to invite page
	if (!session) {
		redirect(`/login?redirect=/invite/${token}`)
	}

	// Fetch invitation details
	const caller = await createServerCaller()

	try {
		const invitation = await caller.invitations.getByToken({ token })

		return (
			<div className="container flex min-h-screen items-center justify-center py-10">
				<AcceptInvitation invitation={invitation} token={token} />
			</div>
		)
	} catch {
		// If invitation not found or invalid, show error
		return (
			<div className="container flex min-h-screen items-center justify-center py-10">
				<div className="w-full max-w-md space-y-6 rounded-lg border p-8 text-center">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold">Invalid Invitation</h1>
						<p className="text-muted-foreground">
							This invitation link is invalid, expired, or has already been
							used.
						</p>
					</div>

					<a
						href="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Go to Dashboard
					</a>
				</div>
			</div>
		)
	}
}
