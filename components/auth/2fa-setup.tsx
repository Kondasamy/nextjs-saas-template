'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const verifyCodeSchema = z.object({
	code: z.string().length(6, 'Code must be 6 digits'),
})

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>

export function TwoFactorSetup() {
	const [qrCode, _setQrCode] = useState<string | null>(null)
	const [secret, _setSecret] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<VerifyCodeFormData>({
		resolver: zodResolver(verifyCodeSchema),
	})

	const handleSetup = async () => {
		setIsLoading(true)
		try {
			// This would call your tRPC endpoint to generate 2FA secret
			// For now, this is a placeholder
			toast.info('2FA setup functionality will be implemented with tRPC')
		} catch {
			toast.error('Failed to setup 2FA')
		} finally {
			setIsLoading(false)
		}
	}

	const handleVerify = async (_data: VerifyCodeFormData) => {
		setIsLoading(true)
		try {
			// This would call your tRPC endpoint to verify and enable 2FA
			toast.success('2FA enabled successfully')
		} catch {
			toast.error('Invalid code. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	if (!qrCode) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Enable two-factor authentication to add an extra layer of security to
					your account.
				</p>
				<Button onClick={handleSetup} disabled={isLoading}>
					{isLoading ? 'Setting up...' : 'Setup 2FA'}
				</Button>
			</div>
		)
	}

	return (
		<form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">
					Scan this QR code with your authenticator app:
				</p>
				{/* QR Code would be displayed here */}
				<div className="p-4 border rounded-lg bg-muted">
					<p className="text-xs text-muted-foreground">QR Code placeholder</p>
				</div>
				{secret && (
					<p className="text-xs text-muted-foreground">
						Or enter this code manually: <code>{secret}</code>
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="code">Enter verification code</Label>
				<Input
					id="code"
					type="text"
					placeholder="000000"
					maxLength={6}
					{...form.register('code')}
				/>
				{form.formState.errors.code && (
					<p className="text-sm text-destructive">
						{form.formState.errors.code.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? 'Verifying...' : 'Verify and Enable'}
			</Button>
		</form>
	)
}
