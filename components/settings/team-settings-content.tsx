'use client'

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
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function TeamSettingsContent() {
	const { currentWorkspace, isLoading } = useWorkspace()

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Team Settings</h1>
					<p className="text-muted-foreground">Loading workspace...</p>
				</div>
			</div>
		)
	}

	if (!currentWorkspace) {
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
						Manage team members for {currentWorkspace.name}
					</p>
				</div>
				<InviteMemberDialog organizationId={currentWorkspace.id} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						Manage who has access to this workspace
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TeamMembersTable organizationId={currentWorkspace.id} />
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
					<PendingInvitations organizationId={currentWorkspace.id} />
				</CardContent>
			</Card>
		</div>
	)
}
