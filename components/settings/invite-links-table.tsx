'use client'

import { formatDistanceToNow } from 'date-fns'
import { Copy, Link2, Loader2, Plus, Trash2 } from 'lucide-react'
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function InviteLinksTable() {
	const { currentWorkspace } = useWorkspace()
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
	const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)

	// Form state for creating new link
	const [roleId, setRoleId] = useState<string>('')
	const [maxUses, setMaxUses] = useState<string>('')
	const [expiresInDays, setExpiresInDays] = useState<string>('7')

	const { data: inviteLinks = [], refetch } =
		trpc.invitations.listInviteLinks.useQuery(
			{ organizationId: currentWorkspace?.id ?? '' },
			{ enabled: !!currentWorkspace }
		)

	const { data: roles = [] } = trpc.permissions.listRoles.useQuery(
		{ organizationId: currentWorkspace?.id ?? '' },
		{ enabled: !!currentWorkspace }
	)

	const createLink = trpc.invitations.createInviteLink.useMutation({
		onSuccess: () => {
			toast.success('Invite link created successfully')
			setCreateDialogOpen(false)
			setRoleId('')
			setMaxUses('')
			setExpiresInDays('7')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to create invite link')
		},
	})

	const revokeLink = trpc.invitations.revokeInviteLink.useMutation({
		onSuccess: () => {
			toast.success('Invite link revoked successfully')
			setRevokeDialogOpen(false)
			setSelectedLinkId(null)
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to revoke invite link')
		},
	})

	const handleCreateLink = () => {
		if (!currentWorkspace || !roleId) {
			toast.error('Please select a role')
			return
		}

		createLink.mutate({
			organizationId: currentWorkspace.id,
			roleId,
			maxUses: maxUses ? Number.parseInt(maxUses) : undefined,
			expiresInDays: Number.parseInt(expiresInDays),
		})
	}

	const handleCopyLink = (token: string) => {
		const url = `${window.location.origin}/invite/${token}`
		navigator.clipboard.writeText(url)
		toast.success('Invite link copied to clipboard')
	}

	const handleRevoke = () => {
		if (!selectedLinkId) return
		revokeLink.mutate({ id: selectedLinkId })
	}

	if (!currentWorkspace) {
		return null
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Create shareable invitation links that anyone can use to join your
						workspace.
					</p>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Create Link
					</Button>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Role</TableHead>
								<TableHead>Uses</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{inviteLinks.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-muted-foreground"
									>
										No active invite links
									</TableCell>
								</TableRow>
							) : (
								inviteLinks.map((link) => {
									const isExpired = new Date(link.expiresAt) < new Date()
									const isMaxedOut =
										link.maxUses && link.usedCount >= link.maxUses

									return (
										<TableRow key={link.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<Link2 className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">{link.role.name}</span>
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{link.usedCount}
													{link.maxUses ? ` / ${link.maxUses}` : ' / ∞'}
												</span>
											</TableCell>
											<TableCell>
												<span
													className={`text-sm ${
														isExpired
															? 'text-destructive'
															: 'text-muted-foreground'
													}`}
												>
													{isExpired
														? 'Expired'
														: formatDistanceToNow(new Date(link.expiresAt), {
																addSuffix: true,
															})}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(new Date(link.createdAt), {
														addSuffix: true,
													})}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleCopyLink(link.token)}
														disabled={isExpired || isMaxedOut}
													>
														<Copy className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															setSelectedLinkId(link.id)
															setRevokeDialogOpen(true)
														}}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Create Link Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Create Invite Link</DialogTitle>
						<DialogDescription>
							Generate a shareable link to invite members to your workspace
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select value={roleId} onValueChange={setRoleId}>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="max-uses">
								Maximum Uses (leave empty for unlimited)
							</Label>
							<Input
								id="max-uses"
								type="number"
								min="1"
								placeholder="Unlimited"
								value={maxUses}
								onChange={(e) => setMaxUses(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="expires">Expires In (days)</Label>
							<Select value={expiresInDays} onValueChange={setExpiresInDays}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">1 day</SelectItem>
									<SelectItem value="7">7 days</SelectItem>
									<SelectItem value="14">14 days</SelectItem>
									<SelectItem value="30">30 days</SelectItem>
									<SelectItem value="90">90 days</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
							disabled={createLink.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateLink}
							disabled={createLink.isPending || !roleId}
						>
							{createLink.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								'Create Link'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Revoke Link Dialog */}
			<Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Revoke Invite Link</DialogTitle>
						<DialogDescription>
							Are you sure you want to revoke this invite link? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRevokeDialogOpen(false)
								setSelectedLinkId(null)
							}}
							disabled={revokeLink.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRevoke}
							disabled={revokeLink.isPending}
						>
							{revokeLink.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Revoking...
								</>
							) : (
								'Revoke Link'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
