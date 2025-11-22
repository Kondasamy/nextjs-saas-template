'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Loader2, Shield, XCircle } from 'lucide-react'
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
import { trpc } from '@/lib/trpc/client'
import { TwoFactorSetupDialog } from './two-factor-setup-dialog'

export function TwoFactorSettings() {
	const [setupDialogOpen, setSetupDialogOpen] = useState(false)
	const [disableDialogOpen, setDisableDialogOpen] = useState(false)
	const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
	const [disableCode, setDisableCode] = useState('')
	const [regenerateCode, setRegenerateCode] = useState('')
	const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

	const { data: status, refetch } = trpc.user.get2FAStatus.useQuery()

	const disable2FA = trpc.user.disable2FA.useMutation({
		onSuccess: () => {
			toast.success('Two-factor authentication disabled')
			setDisableDialogOpen(false)
			setDisableCode('')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to disable 2FA')
		},
	})

	const regenerateBackupCodes = trpc.user.regenerateBackupCodes.useMutation({
		onSuccess: (data) => {
			setNewBackupCodes(data.backupCodes)
			toast.success('Backup codes regenerated successfully')
			setRegenerateCode('')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to regenerate backup codes')
		},
	})

	const handleDisable = () => {
		if (disableCode.length === 6) {
			disable2FA.mutate({ code: disableCode })
		}
	}

	const handleRegenerate = () => {
		if (regenerateCode.length === 6) {
			regenerateBackupCodes.mutate({ code: regenerateCode })
		}
	}

	const handleCopyBackupCodes = () => {
		const codesText = newBackupCodes.join('\n')
		navigator.clipboard.writeText(codesText)
		toast.success('Backup codes copied to clipboard')
	}

	const handleDownloadBackupCodes = () => {
		const codesText = newBackupCodes.join('\n')
		const blob = new Blob([codesText], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = '2fa-backup-codes.txt'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		toast.success('Backup codes downloaded')
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-3">
						<div
							className={`rounded-full p-2 ${
								status?.enabled
									? 'bg-green-500/10 text-green-500'
									: 'bg-muted text-muted-foreground'
							}`}
						>
							<Shield className="h-5 w-5" />
						</div>
						<div>
							<p className="font-medium">Two-Factor Authentication</p>
							<p className="text-sm text-muted-foreground">
								{status?.enabled ? (
									<span className="flex items-center gap-1">
										<CheckCircle2 className="h-3 w-3 text-green-500" />
										Enabled
										{status.setupDate && (
											<>
												{' '}
												·{' '}
												{formatDistanceToNow(new Date(status.setupDate), {
													addSuffix: true,
												})}
											</>
										)}
									</span>
								) : (
									<span className="flex items-center gap-1">
										<XCircle className="h-3 w-3 text-muted-foreground" />
										Not enabled
									</span>
								)}
							</p>
						</div>
					</div>

					<div className="flex gap-2">
						{status?.enabled ? (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setRegenerateDialogOpen(true)}
								>
									Regenerate Codes
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setDisableDialogOpen(true)}
								>
									Disable
								</Button>
							</>
						) : (
							<Button size="sm" onClick={() => setSetupDialogOpen(true)}>
								Enable 2FA
							</Button>
						)}
					</div>
				</div>

				{status?.enabled && (
					<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
						<p className="text-sm text-muted-foreground">
							Your account is protected with two-factor authentication. You'll
							be asked for a verification code each time you sign in.
						</p>
					</div>
				)}
			</div>

			{/* Setup Dialog */}
			<TwoFactorSetupDialog
				open={setupDialogOpen}
				onOpenChange={setSetupDialogOpen}
				onSuccess={refetch}
			/>

			{/* Disable Dialog */}
			<Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Disable Two-Factor Authentication</DialogTitle>
						<DialogDescription>
							Enter your current verification code to disable 2FA
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="disable-code">Verification Code</Label>
							<Input
								id="disable-code"
								type="text"
								placeholder="000000"
								maxLength={6}
								value={disableCode}
								onChange={(e) =>
									setDisableCode(e.target.value.replace(/\D/g, ''))
								}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleDisable()
									}
								}}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDisableDialogOpen(false)
								setDisableCode('')
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDisable}
							disabled={disable2FA.isPending || disableCode.length !== 6}
						>
							{disable2FA.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Disabling...
								</>
							) : (
								'Disable 2FA'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Regenerate Backup Codes Dialog */}
			<Dialog
				open={regenerateDialogOpen}
				onOpenChange={(open) => {
					setRegenerateDialogOpen(open)
					if (!open) {
						setRegenerateCode('')
						setNewBackupCodes([])
					}
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Regenerate Backup Codes</DialogTitle>
						<DialogDescription>
							{newBackupCodes.length > 0
								? 'Save these new backup codes in a safe place'
								: 'Enter your verification code to generate new backup codes'}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{newBackupCodes.length > 0 ? (
							<>
								<div className="rounded-lg border bg-muted p-4">
									<div className="grid grid-cols-2 gap-2 font-mono text-sm">
										{newBackupCodes.map((code, index) => (
											<div key={index} className="flex items-center gap-2">
												<CheckCircle2 className="h-4 w-4 text-green-500" />
												<span>{code}</span>
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										variant="outline"
										className="flex-1"
										onClick={handleCopyBackupCodes}
									>
										Copy Codes
									</Button>
									<Button
										variant="outline"
										className="flex-1"
										onClick={handleDownloadBackupCodes}
									>
										Download
									</Button>
								</div>
							</>
						) : (
							<div className="space-y-2">
								<Label htmlFor="regenerate-code">Verification Code</Label>
								<Input
									id="regenerate-code"
									type="text"
									placeholder="000000"
									maxLength={6}
									value={regenerateCode}
									onChange={(e) =>
										setRegenerateCode(e.target.value.replace(/\D/g, ''))
									}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleRegenerate()
										}
									}}
								/>
							</div>
						)}
					</div>

					<DialogFooter>
						{newBackupCodes.length > 0 ? (
							<Button
								onClick={() => {
									setRegenerateDialogOpen(false)
									setNewBackupCodes([])
									setRegenerateCode('')
								}}
							>
								Done
							</Button>
						) : (
							<>
								<Button
									variant="outline"
									onClick={() => {
										setRegenerateDialogOpen(false)
										setRegenerateCode('')
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleRegenerate}
									disabled={
										regenerateBackupCodes.isPending ||
										regenerateCode.length !== 6
									}
								>
									{regenerateBackupCodes.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Generating...
										</>
									) : (
										'Generate New Codes'
									)}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
