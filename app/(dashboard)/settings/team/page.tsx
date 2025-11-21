import { InviteMemberDialog } from '@/components/settings/invite-member-dialog'
import { PendingInvitations } from '@/components/settings/pending-invitations'
import { TeamMembersTable } from '@/components/settings/team-members-table'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { requireAuth } from '@/lib/auth/auth-helpers'
import { createServerCaller } from '@/lib/trpc/server'

export default async function TeamSettingsPage() {
	await requireAuth()
	const caller = await createServerCaller()
	const user = await caller.user.getCurrent()

	// Get user's first organization (or allow selection)
	const defaultOrg = user?.organizations?.[0]?.organization

	if (!defaultOrg) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Team Settings</h1>
					<p className="text-muted-foreground">
						You need to create a workspace first to manage team members.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Team Settings</h1>
					<p className="text-muted-foreground">
						Manage team members for {defaultOrg.name}
					</p>
				</div>
				<InviteMemberDialog organizationId={defaultOrg.id} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						Manage who has access to this workspace
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TeamMembersTable organizationId={defaultOrg.id} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Pending Invitations</CardTitle>
					<CardDescription>
						Invitations that haven't been accepted yet
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PendingInvitations organizationId={defaultOrg.id} />
				</CardContent>
			</Card>
		</div>
	)
}
