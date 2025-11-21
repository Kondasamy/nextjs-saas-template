'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'

const inviteSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	roleId: z.string().min(1, 'Please select a role'),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteMemberDialogProps {
	organizationId: string
}

export function InviteMemberDialog({
	organizationId,
}: InviteMemberDialogProps) {
	const [open, setOpen] = useState(false)

	const form = useForm<InviteFormData>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: '',
			roleId: 'member',
		},
	})

	const inviteMember = trpc.invitations.create.useMutation({
		onSuccess: () => {
			toast.success('Invitation sent successfully!')
			form.reset()
			setOpen(false)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to send invitation')
		},
	})

	const handleInvite = (data: InviteFormData) => {
		inviteMember.mutate({
			organizationId,
			email: data.email,
			roleId: data.roleId,
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus className="mr-2 h-4 w-4" />
					Invite Member
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Team Member</DialogTitle>
					<DialogDescription>
						Send an invitation to join your workspace
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">
							Email Address <span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="colleague@example.com"
							{...form.register('email')}
						/>
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">
							Role <span className="text-destructive">*</span>
						</Label>
						<Select
							value={form.watch('roleId')}
							onValueChange={(value) => form.setValue('roleId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="owner">
									<div className="flex flex-col items-start">
										<span className="font-medium">Owner</span>
										<span className="text-xs text-muted-foreground">
											Full access to everything
										</span>
									</div>
								</SelectItem>
								<SelectItem value="admin">
									<div className="flex flex-col items-start">
										<span className="font-medium">Admin</span>
										<span className="text-xs text-muted-foreground">
											Can manage members and settings
										</span>
									</div>
								</SelectItem>
								<SelectItem value="member">
									<div className="flex flex-col items-start">
										<span className="font-medium">Member</span>
										<span className="text-xs text-muted-foreground">
											Can create and edit resources
										</span>
									</div>
								</SelectItem>
								<SelectItem value="viewer">
									<div className="flex flex-col items-start">
										<span className="font-medium">Viewer</span>
										<span className="text-xs text-muted-foreground">
											Read-only access
										</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
						{form.formState.errors.roleId && (
							<p className="text-sm text-destructive">
								{form.formState.errors.roleId.message}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={inviteMember.isPending}>
							{inviteMember.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								'Send Invitation'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
