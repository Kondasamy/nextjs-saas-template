'use client'

import {
	AlertCircle,
	CheckCircle2,
	Copy,
	Download,
	Loader2,
} from 'lucide-react'
import Image from 'next/image'
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

interface TwoFactorSetupDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

type SetupStep = 'scan' | 'verify' | 'backup'

export function TwoFactorSetupDialog({
	open,
	onOpenChange,
	onSuccess,
}: TwoFactorSetupDialogProps) {
	const [step, setStep] = useState<SetupStep>('scan')
	const [qrCode, setQrCode] = useState<string | null>(null)
	const [secret, setSecret] = useState<string | null>(null)
	const [backupCodes, setBackupCodes] = useState<string[]>([])
	const [verificationCode, setVerificationCode] = useState('')

	const setup2FA = trpc.user.setup2FA.useMutation({
		onSuccess: (data) => {
			setQrCode(data.qrCode)
			setSecret(data.secret)
			setBackupCodes(data.backupCodes)
			setStep('verify')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to setup 2FA')
		},
	})

	const verify2FA = trpc.user.verify2FA.useMutation({
		onSuccess: () => {
			setStep('backup')
		},
		onError: (error) => {
			toast.error(error.message || 'Invalid verification code')
		},
	})

	const handleCopySecret = () => {
		if (secret) {
			navigator.clipboard.writeText(secret)
			toast.success('Secret key copied to clipboard')
		}
	}

	const handleCopyBackupCodes = () => {
		const codesText = backupCodes.join('\n')
		navigator.clipboard.writeText(codesText)
		toast.success('Backup codes copied to clipboard')
	}

	const handleDownloadBackupCodes = () => {
		const codesText = backupCodes.join('\n')
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

	const handleVerify = () => {
		if (verificationCode.length === 6) {
			verify2FA.mutate({ code: verificationCode })
		}
	}

	const handleClose = () => {
		if (step === 'backup') {
			onSuccess()
		}
		onOpenChange(false)
		// Reset state
		setTimeout(() => {
			setStep('scan')
			setQrCode(null)
			setSecret(null)
			setBackupCodes([])
			setVerificationCode('')
		}, 300)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				{step === 'scan' && (
					<>
						<DialogHeader>
							<DialogTitle>Setup Two-Factor Authentication</DialogTitle>
							<DialogDescription>
								Add an extra layer of security to your account with 2FA
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									You'll need an authenticator app like Google Authenticator,
									Authy, or 1Password to scan the QR code.
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								onClick={() => setup2FA.mutate()}
								disabled={setup2FA.isPending}
							>
								{setup2FA.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Generating...
									</>
								) : (
									'Continue'
								)}
							</Button>
						</DialogFooter>
					</>
				)}

				{step === 'verify' && qrCode && secret && (
					<>
						<DialogHeader>
							<DialogTitle>Scan QR Code</DialogTitle>
							<DialogDescription>
								Use your authenticator app to scan this QR code
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="flex flex-col items-center gap-4">
								<div className="rounded-lg border bg-white p-4">
									<Image
										src={qrCode}
										alt="2FA QR Code"
										width={200}
										height={200}
									/>
								</div>

								<div className="w-full space-y-2">
									<Label className="text-sm text-muted-foreground">
										Or enter this code manually:
									</Label>
									<div className="flex gap-2">
										<Input value={secret} readOnly className="font-mono" />
										<Button
											variant="outline"
											size="icon"
											onClick={handleCopySecret}
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="verification-code">Verification Code</Label>
								<Input
									id="verification-code"
									type="text"
									placeholder="000000"
									maxLength={6}
									value={verificationCode}
									onChange={(e) =>
										setVerificationCode(e.target.value.replace(/\D/g, ''))
									}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleVerify()
										}
									}}
								/>
								<p className="text-xs text-muted-foreground">
									Enter the 6-digit code from your authenticator app
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								onClick={handleVerify}
								disabled={verify2FA.isPending || verificationCode.length !== 6}
							>
								{verify2FA.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Verifying...
									</>
								) : (
									'Verify and Enable'
								)}
							</Button>
						</DialogFooter>
					</>
				)}

				{step === 'backup' && (
					<>
						<DialogHeader>
							<DialogTitle>Save Backup Codes</DialogTitle>
							<DialogDescription>
								Store these codes in a safe place. Each code can only be used
								once.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="rounded-lg border bg-muted p-4">
								<div className="grid grid-cols-2 gap-2 font-mono text-sm">
									{backupCodes.map((code, index) => (
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
									<Copy className="mr-2 h-4 w-4" />
									Copy Codes
								</Button>
								<Button
									variant="outline"
									className="flex-1"
									onClick={handleDownloadBackupCodes}
								>
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</div>

							<div className="flex items-start gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
								<AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
								<p className="text-xs text-muted-foreground">
									Keep these codes safe! You'll need them if you lose access to
									your authenticator app.
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleClose}>Done</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
