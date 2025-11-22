'use client'

import { Loader2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'

interface BulkInviteDialogProps {
	organizationId: string
}

export function BulkInviteDialog({ organizationId }: BulkInviteDialogProps) {
	const [open, setOpen] = useState(false)
	const [emailsText, setEmailsText] = useState('')
	const [roleId, setRoleId] = useState('')
	const [parsedEmails, setParsedEmails] = useState<string[]>([])
	const [showResults, setShowResults] = useState(false)
	const [results, setResults] = useState<{
		successCount: number
		failCount: number
		successful: string[]
		failed: Array<{ email: string; reason: string }>
	} | null>(null)

	const { data: roles = [] } = trpc.permissions.listRoles.useQuery({
		organizationId,
	})

	const bulkInvite = trpc.invitations.bulkInviteMembers.useMutation({
		onSuccess: (data) => {
			setResults({
				successCount: data.successCount,
				failCount: data.failCount,
				successful: data.successful as string[],
				failed: data.failed as Array<{ email: string; reason: string }>,
			})
			setShowResults(true)
			toast.success(`Sent ${data.successCount} invitation(s)`)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to send invitations')
		},
	})

	const parseEmails = (text: string): string[] => {
		// Split by newlines, commas, semicolons, or spaces
		const emails = text
			.split(/[\n,;\s]+/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0)
			.filter((email) => {
				// Basic email validation
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				return emailRegex.test(email)
			})

		// Remove duplicates
		return Array.from(new Set(emails))
	}

	const handleTextChange = (text: string) => {
		setEmailsText(text)
		const emails = parseEmails(text)
		setParsedEmails(emails)
		setShowResults(false)
	}

	const handleInvite = () => {
		if (parsedEmails.length === 0) {
			toast.error('Please enter at least one valid email address')
			return
		}

		if (!roleId) {
			toast.error('Please select a role')
			return
		}

		bulkInvite.mutate({
			organizationId,
			emails: parsedEmails,
			roleId,
		})
	}

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen)
		if (!isOpen) {
			// Only reset when closing
			setEmailsText('')
			setParsedEmails([])
			setResults(null)
			setShowResults(false)
			setRoleId('')
		}
	}

	const handleClose = () => {
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<Users className="mr-2 h-4 w-4" />
					Bulk Invite
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Bulk Invite Team Members</DialogTitle>
					<DialogDescription>
						Invite multiple people at once by entering their email addresses
					</DialogDescription>
				</DialogHeader>

				{!showResults ? (
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="emails">
								Email Addresses <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="emails"
								placeholder="colleague1@example.com, colleague2@example.com
or one email per line"
								rows={6}
								value={emailsText}
								onChange={(e) => handleTextChange(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								Separate emails with commas, semicolons, spaces, or newlines
							</p>
						</div>

						{parsedEmails.length > 0 && (
							<div className="rounded-lg border bg-muted/50 p-3">
								<p className="text-sm font-medium">
									Valid emails found: {parsedEmails.length}
								</p>
								<div className="mt-2 max-h-32 overflow-y-auto">
									<ul className="text-xs text-muted-foreground space-y-1">
										{parsedEmails.slice(0, 10).map((email, index) => (
											<li key={index}>• {email}</li>
										))}
										{parsedEmails.length > 10 && (
											<li>... and {parsedEmails.length - 10} more</li>
										)}
									</ul>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="role">
								Role <span className="text-destructive">*</span>
							</Label>
							<Select value={roleId} onValueChange={setRoleId}>
								<SelectTrigger className="min-h-[45px]">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent position="popper" sideOffset={5}>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											<div className="flex flex-col items-start">
												<span className="font-medium">{role.name}</span>
												{role.description && (
													<span className="text-xs text-muted-foreground">
														{role.description}
													</span>
												)}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				) : (
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<h3 className="font-semibold">Invitation Results</h3>

							{results && results.successCount > 0 && (
								<div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
									<p className="text-sm font-medium text-green-600">
										✓ Successfully sent {results.successCount} invitation(s)
									</p>
								</div>
							)}

							{results && results.failCount > 0 && (
								<div className="space-y-2">
									<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
										<p className="text-sm font-medium text-red-600">
											✗ Failed to send {results.failCount} invitation(s)
										</p>
									</div>
									<div className="max-h-48 overflow-y-auto rounded-lg border bg-muted p-3">
										<p className="text-xs font-medium mb-2">
											Failed invitations:
										</p>
										<ul className="space-y-1 text-xs text-muted-foreground">
											{results.failed.map((fail, index) => (
												<li key={index}>
													• {fail.email}: {fail.reason}
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				<DialogFooter>
					{!showResults ? (
						<>
							<Button
								variant="outline"
								onClick={handleClose}
								disabled={bulkInvite.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleInvite}
								disabled={bulkInvite.isPending || parsedEmails.length === 0}
							>
								{bulkInvite.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending Invitations...
									</>
								) : (
									`Send ${parsedEmails.length} Invitation${parsedEmails.length !== 1 ? 's' : ''}`
								)}
							</Button>
						</>
					) : (
						<Button onClick={handleClose}>Done</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
