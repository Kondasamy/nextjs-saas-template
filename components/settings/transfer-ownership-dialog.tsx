'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [confirmationText, setConfirmationText] = useState('')

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
		setSelectedUserId('')
		setConfirmationText('')
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen) {
			resetDialog()
		}
	}

	const handleNext = () => {
		if (!selectedUserId) {
			toast.error('Please select a member')
			return
		}
		setStep('confirm')
	}

	const handleTransfer = () => {
		if (confirmationText !== workspaceName) {
			toast.error('Workspace name does not match')
			return
		}

		transferOwnership.mutate({
			organizationId,
			newOwnerId: selectedUserId,
		})
	}

	// Filter out current user and existing owners from the list
	const eligibleMembers = members.filter(
		(member) =>
			member.userId !== currentUserId && !member.role.permissions.includes('*')
	)

	const selectedMember = members.find((m) => m.userId === selectedUserId)

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
								<Label htmlFor="new-owner">New Owner</Label>
								<Select
									value={selectedUserId}
									onValueChange={setSelectedUserId}
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
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={transferOwnership.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleNext}
								disabled={!selectedUserId || transferOwnership.isPending}
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

						<div className="space-y-4 py-4">
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
									value={confirmationText}
									onChange={(e) => setConfirmationText(e.target.value)}
									placeholder={workspaceName}
									autoComplete="off"
								/>
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
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setStep('select')}
								disabled={transferOwnership.isPending}
							>
								Back
							</Button>
							<Button
								variant="destructive"
								onClick={handleTransfer}
								disabled={
									confirmationText !== workspaceName ||
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
