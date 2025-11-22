'use client'

import { formatDistanceToNow } from 'date-fns'
import { Edit2, Key, Loader2, Plus, Trash2 } from 'lucide-react'
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'

export function PasskeyList() {
	const [renameDialogOpen, setRenameDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
	const [selectedPasskey, setSelectedPasskey] = useState<{
		id: string
		name: string
	} | null>(null)
	const [newName, setNewName] = useState('')
	const [newPasskeyName, setNewPasskeyName] = useState('')
	const [isRegistering, setIsRegistering] = useState(false)

	const { data: passkeys = [], refetch } = trpc.user.listPasskeys.useQuery()

	const renamePasskey = trpc.user.renamePasskey.useMutation({
		onSuccess: () => {
			toast.success('Passkey renamed successfully')
			setRenameDialogOpen(false)
			setSelectedPasskey(null)
			setNewName('')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to rename passkey')
		},
	})

	const removePasskey = trpc.user.removePasskey.useMutation({
		onSuccess: () => {
			toast.success('Passkey removed successfully')
			setDeleteDialogOpen(false)
			setSelectedPasskey(null)
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to remove passkey')
		},
	})

	const handleRename = () => {
		if (selectedPasskey && newName.trim()) {
			renamePasskey.mutate({
				passkeyId: selectedPasskey.id,
				name: newName.trim(),
			})
		}
	}

	const handleDelete = () => {
		if (selectedPasskey) {
			removePasskey.mutate({ passkeyId: selectedPasskey.id })
		}
	}

	const handleRegister = async () => {
		if (!newPasskeyName.trim()) {
			toast.error('Please enter a name for your passkey')
			return
		}

		setIsRegistering(true)

		try {
			// Call Better Auth's passkey registration
			const response = await fetch('/api/auth/passkey/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newPasskeyName.trim(),
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to register passkey')
			}

			const { options } = await response.json()

			// Use WebAuthn API to create credential
			const credential = await navigator.credentials.create({
				publicKey: options,
			})

			if (!credential) {
				throw new Error('Failed to create credential')
			}

			// Verify the credential with Better Auth
			const verifyResponse = await fetch('/api/auth/passkey/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					credential,
					name: newPasskeyName.trim(),
				}),
			})

			if (!verifyResponse.ok) {
				const error = await verifyResponse.json()
				throw new Error(error.message || 'Failed to verify passkey')
			}

			toast.success('Passkey registered successfully')
			setRegisterDialogOpen(false)
			setNewPasskeyName('')
			refetch()
		} catch (error) {
			console.error('Passkey registration error:', error)
			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to register passkey. Please try again.')
			}
		} finally {
			setIsRegistering(false)
		}
	}

	const isPasskeySupported =
		typeof window !== 'undefined' && window.PublicKeyCredential !== undefined

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">
							Passkeys allow you to sign in using biometrics, security keys, or
							your device's screen lock.
						</p>
						{!isPasskeySupported && (
							<p className="text-sm text-destructive mt-2">
								Passkeys are not supported in your current browser.
							</p>
						)}
					</div>
					<Button
						onClick={() => setRegisterDialogOpen(true)}
						disabled={!isPasskeySupported}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Passkey
					</Button>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Device</TableHead>
								<TableHead>Added</TableHead>
								<TableHead>Last Used</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{passkeys.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center text-muted-foreground"
									>
										No passkeys registered
									</TableCell>
								</TableRow>
							) : (
								passkeys.map((passkey) => (
									<TableRow key={passkey.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Key className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium">
													{passkey.deviceName}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{formatDistanceToNow(new Date(passkey.createdAt), {
													addSuffix: true,
												})}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{passkey.lastUsedAt
													? formatDistanceToNow(new Date(passkey.lastUsedAt), {
															addSuffix: true,
														})
													: 'Never'}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setSelectedPasskey({
															id: passkey.id,
															name: passkey.deviceName,
														})
														setNewName(passkey.deviceName)
														setRenameDialogOpen(true)
													}}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setSelectedPasskey({
															id: passkey.id,
															name: passkey.deviceName,
														})
														setDeleteDialogOpen(true)
													}}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Register Passkey Dialog */}
			<Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Register Passkey</DialogTitle>
						<DialogDescription>
							Give your passkey a name to help you identify it later
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="passkey-name">Passkey Name</Label>
							<Input
								id="passkey-name"
								type="text"
								placeholder="e.g., MacBook Pro, iPhone, YubiKey"
								value={newPasskeyName}
								onChange={(e) => setNewPasskeyName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleRegister()
									}
								}}
							/>
							<p className="text-xs text-muted-foreground">
								Choose a name that helps you remember this device or security
								key
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRegisterDialogOpen(false)
								setNewPasskeyName('')
							}}
							disabled={isRegistering}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRegister}
							disabled={isRegistering || !newPasskeyName.trim()}
						>
							{isRegistering ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Registering...
								</>
							) : (
								'Register Passkey'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Rename Passkey Dialog */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Rename Passkey</DialogTitle>
						<DialogDescription>
							Enter a new name for this passkey
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="new-name">New Name</Label>
							<Input
								id="new-name"
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleRename()
									}
								}}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRenameDialogOpen(false)
								setSelectedPasskey(null)
								setNewName('')
							}}
							disabled={renamePasskey.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRename}
							disabled={renamePasskey.isPending || !newName.trim()}
						>
							{renamePasskey.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Renaming...
								</>
							) : (
								'Rename'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Passkey Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Remove Passkey</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove "{selectedPasskey?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false)
								setSelectedPasskey(null)
							}}
							disabled={removePasskey.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={removePasskey.isPending}
						>
							{removePasskey.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Removing...
								</>
							) : (
								'Remove Passkey'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
