'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

const transferOwnershipSchema = z.object({
	selectedUserId: z.string().min(1, 'Please select a member'),
	confirmationText: z.string(),
})

type TransferOwnershipFormData = z.infer<typeof transferOwnershipSchema>

interface TransferOwnershipDialogProps {
	organizationId: string
	workspaceName: string
	members: Array<{
		id: string
		userId: string
		user: {
			id: string
			name: string | null
			email: string
			image: string | null
		}
		role: {
			id: string
			name: string
			permissions: string[]
		}
	}>
	currentUserId: string
	children: React.ReactNode
}

export function TransferOwnershipDialog({
	organizationId,
	workspaceName,
	members,
	currentUserId,
	children,
}: TransferOwnershipDialogProps) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<'select' | 'confirm'>('select')

	const form = useForm<TransferOwnershipFormData>({
		resolver: zodResolver(transferOwnershipSchema),
		defaultValues: {
			selectedUserId: '',
			confirmationText: '',
		},
	})

	const transferOwnership = trpc.workspace.transferOwnership.useMutation({
		onSuccess: () => {
			toast.success('Ownership transferred successfully')
			setOpen(false)
			resetDialog()
			// Refresh the page to update permissions
			window.location.reload()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to transfer ownership')
		},
	})

	const resetDialog = () => {
		setStep('select')
		form.reset()
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen) {
			resetDialog()
		}
	}

	const handleNext = () => {
		const selectedUserId = form.getValues('selectedUserId')
		if (!selectedUserId) {
			form.setError('selectedUserId', {
				message: 'Please select a member',
			})
			return
		}
		setStep('confirm')
	}

	const handleTransfer = (data: TransferOwnershipFormData) => {
		if (data.confirmationText !== workspaceName) {
			form.setError('confirmationText', {
				message: 'Workspace name does not match',
			})
			return
		}

		transferOwnership.mutate({
			organizationId,
			newOwnerId: data.selectedUserId,
		})
	}

	// Filter out current user and existing owners from the list
	const eligibleMembers = members.filter(
		(member) =>
			member.userId !== currentUserId && !member.role.permissions.includes('*')
	)

	const selectedMember = members.find(
		(m) => m.userId === form.watch('selectedUserId')
	)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				{step === 'select' && (
					<>
						<DialogHeader>
							<DialogTitle>Transfer Workspace Ownership</DialogTitle>
							<DialogDescription>
								Select a team member to transfer ownership of this workspace to.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="new-owner">
									New Owner <span className="text-destructive">*</span>
								</Label>
								<Select
									value={form.watch('selectedUserId')}
									onValueChange={(value) =>
										form.setValue('selectedUserId', value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a team member" />
									</SelectTrigger>
									<SelectContent>
										{eligibleMembers.length === 0 ? (
											<div className="px-2 py-4 text-center text-sm text-muted-foreground">
												No eligible members to transfer ownership to
											</div>
										) : (
											eligibleMembers.map((member) => (
												<SelectItem key={member.userId} value={member.userId}>
													<div className="flex items-center gap-2">
														<Avatar className="h-6 w-6">
															<AvatarImage
																src={member.user.image || undefined}
															/>
															<AvatarFallback className="text-xs">
																{member.user.name?.[0]?.toUpperCase() ||
																	member.user.email[0]?.toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div className="flex flex-col">
															<span className="text-sm">
																{member.user.name || member.user.email}
															</span>
															<span className="text-xs text-muted-foreground">
																{member.role.name}
															</span>
														</div>
													</div>
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{form.formState.errors.selectedUserId && (
									<p className="text-sm text-destructive">
										{form.formState.errors.selectedUserId.message}
									</p>
								)}
							</div>

							<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
								<div className="flex gap-2">
									<AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
									<div className="space-y-1">
										<p className="text-sm font-medium text-orange-900 dark:text-orange-100">
											Important Information
										</p>
										<ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
											<li>" You will be demoted to Admin role</li>
											<li>" The new owner will have full control</li>
											<li>" This action cannot be easily undone</li>
										</ul>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={transferOwnership.isPending}
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleNext}
								disabled={
									!form.watch('selectedUserId') || transferOwnership.isPending
								}
							>
								Continue
							</Button>
						</DialogFooter>
					</>
				)}

				{step === 'confirm' && (
					<>
						<DialogHeader>
							<DialogTitle>Confirm Ownership Transfer</DialogTitle>
							<DialogDescription>
								This is a critical action. Please confirm by typing the
								workspace name.
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={form.handleSubmit(handleTransfer)}
							className="space-y-4 py-4"
						>
							{selectedMember && (
								<div className="rounded-lg border bg-muted/50 p-4">
									<p className="mb-2 text-sm font-medium">New Owner:</p>
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={selectedMember.user.image || undefined}
											/>
											<AvatarFallback>
												{selectedMember.user.name?.[0]?.toUpperCase() ||
													selectedMember.user.email[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">
												{selectedMember.user.name || selectedMember.user.email}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedMember.user.email}
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="confirmation">
									Type <strong>{workspaceName}</strong> to confirm
								</Label>
								<Input
									id="confirmation"
									{...form.register('confirmationText')}
									placeholder={workspaceName}
									autoComplete="off"
								/>
								{form.formState.errors.confirmationText && (
									<p className="text-sm text-destructive">
										{form.formState.errors.confirmationText.message}
									</p>
								)}
							</div>

							<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
								<div className="flex gap-2">
									<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
									<div className="space-y-1">
										<p className="text-sm font-medium text-red-900 dark:text-red-100">
											Warning
										</p>
										<p className="text-sm text-red-800 dark:text-red-200">
											After transferring ownership, only the new owner can
											transfer it back to you. Make sure you trust this person.
										</p>
									</div>
								</div>
							</div>
						</form>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep('select')}
								disabled={transferOwnership.isPending}
							>
								Back
							</Button>
							<Button
								type="submit"
								variant="destructive"
								onClick={form.handleSubmit(handleTransfer)}
								disabled={
									form.watch('confirmationText') !== workspaceName ||
									transferOwnership.isPending
								}
							>
								{transferOwnership.isPending
									? 'Transferring...'
									: 'Transfer Ownership'}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
