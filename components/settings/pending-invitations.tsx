'use client'

import { formatDistanceToNow } from 'date-fns'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'

interface PendingInvitationsProps {
	organizationId: string
}

export function PendingInvitations({
	organizationId,
}: PendingInvitationsProps) {
	const { data: invitations, refetch } = trpc.invitations.list.useQuery({
		organizationId,
	})

	const cancelInvitation = trpc.invitations.cancel.useMutation({
		onSuccess: () => {
			toast.success('Invitation cancelled')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to cancel invitation')
		},
	})

	const handleCancel = (invitationId: string) => {
		if (confirm('Are you sure you want to cancel this invitation?')) {
			cancelInvitation.mutate({ id: invitationId })
		}
	}

	if (!invitations || invitations.length === 0) {
		return (
			<div className="rounded-md border p-8 text-center">
				<p className="text-sm text-muted-foreground">No pending invitations</p>
			</div>
		)
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Sent</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{invitations.map((invitation) => (
						<TableRow key={invitation.id}>
							<TableCell className="font-medium">{invitation.email}</TableCell>
							<TableCell>
								<Badge variant="outline">{invitation.role.name}</Badge>
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(invitation.createdAt), {
									addSuffix: true,
								})}
							</TableCell>
							<TableCell>
								<Badge
									variant={
										invitation.status === 'pending' ? 'secondary' : 'default'
									}
								>
									{invitation.status}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleCancel(invitation.id)}
									disabled={cancelInvitation.isPending}
								>
									{cancelInvitation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<X className="h-4 w-4" />
									)}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
