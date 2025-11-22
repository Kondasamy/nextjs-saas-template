'use client'

import { CheckCircle2, Loader2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

interface AcceptInvitationProps {
	invitation: {
		id: string
		token: string
		type: string
		organization: {
			id: string
			name: string
			description: string | null
			logo: string | null
		}
		role: {
			id: string
			name: string
			description: string | null
		}
		invitedBy: {
			id: string
			name: string | null
			email: string
		}
	}
	token: string
}

export function AcceptInvitation({ invitation, token }: AcceptInvitationProps) {
	const router = useRouter()
	const [isAccepting, setIsAccepting] = useState(false)
	const [accepted, setAccepted] = useState(false)

	const acceptInvite = trpc.invitations.acceptInviteLink.useMutation({
		onSuccess: () => {
			setAccepted(true)
			toast.success('Successfully joined workspace!')
			// Redirect to the workspace after a short delay
			setTimeout(() => {
				router.push('/')
			}, 2000)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to accept invitation')
			setIsAccepting(false)
		},
	})

	const handleAccept = () => {
		setIsAccepting(true)
		acceptInvite.mutate({ token })
	}

	if (accepted) {
		return (
			<div className="w-full max-w-md space-y-6 rounded-lg border p-8 text-center">
				<div className="flex justify-center">
					<div className="rounded-full bg-green-500/10 p-3">
						<CheckCircle2 className="h-8 w-8 text-green-500" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold">Welcome to the team!</h1>
					<p className="text-muted-foreground">
						You've successfully joined{' '}
						<strong>{invitation.organization.name}</strong>
					</p>
				</div>

				<p className="text-sm text-muted-foreground">
					Redirecting you to the workspace...
				</p>
			</div>
		)
	}

	return (
		<div className="w-full max-w-md space-y-6 rounded-lg border p-8">
			<div className="space-y-2 text-center">
				<div className="flex justify-center">
					<div className="rounded-full bg-primary/10 p-3">
						<Users className="h-8 w-8 text-primary" />
					</div>
				</div>
				<h1 className="text-2xl font-bold">You're Invited!</h1>
				<p className="text-muted-foreground">
					{invitation.invitedBy.name || invitation.invitedBy.email} has invited
					you to join their workspace
				</p>
			</div>

			<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">Workspace</p>
					<div className="flex items-center gap-3">
						{invitation.organization.logo && (
							<img
								src={invitation.organization.logo}
								alt={invitation.organization.name}
								className="h-10 w-10 rounded-lg object-cover"
							/>
						)}
						<div>
							<p className="font-semibold">{invitation.organization.name}</p>
							{invitation.organization.description && (
								<p className="text-sm text-muted-foreground">
									{invitation.organization.description}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">Your Role</p>
					<div>
						<p className="font-semibold">{invitation.role.name}</p>
						{invitation.role.description && (
							<p className="text-sm text-muted-foreground">
								{invitation.role.description}
							</p>
						)}
					</div>
				</div>
			</div>

			{invitation.type === 'link' && (
				<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-3">
					<p className="text-xs text-muted-foreground">
						This is a shared invitation link. By accepting, you'll join the
						workspace with the {invitation.role.name} role.
					</p>
				</div>
			)}

			<Button onClick={handleAccept} disabled={isAccepting} className="w-full">
				{isAccepting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Joining...
					</>
				) : (
					'Accept Invitation'
				)}
			</Button>
		</div>
	)
}
