'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth/client'

const otpSchema = z.object({
	email: z.string().email('Invalid email address'),
	otp: z.string().length(6, 'OTP must be 6 digits'),
})

type OtpFormData = z.infer<typeof otpSchema>

export function OtpForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [emailSent, setEmailSent] = useState(false)

	const form = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
	})

	const handleSendOtp = async () => {
		const email = form.getValues('email')
		if (!email) {
			form.setError('email', { message: 'Email is required' })
			return
		}

		setIsLoading(true)
		try {
			await signIn.otp({
				email,
			})
			setEmailSent(true)
			toast.success('OTP sent! Check your email.')
		} catch {
			toast.error('Failed to send OTP. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleVerifyOtp = async (data: OtpFormData) => {
		setIsLoading(true)
		try {
			await signIn.otp({
				email: data.email,
				otp: data.otp,
			})
			toast.success('Signed in successfully')
		} catch {
			toast.error('Invalid OTP. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={form.handleSubmit(handleVerifyOtp)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<div className="flex gap-2">
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						{...form.register('email')}
						disabled={emailSent}
					/>
					{!emailSent && (
						<Button type="button" onClick={handleSendOtp} disabled={isLoading}>
							Send OTP
						</Button>
					)}
				</div>
				{form.formState.errors.email && (
					<p className="text-sm text-destructive">
						{form.formState.errors.email.message}
					</p>
				)}
			</div>

			{emailSent && (
				<div className="space-y-2">
					<Label htmlFor="otp">Enter OTP</Label>
					<Input
						id="otp"
						type="text"
						placeholder="000000"
						maxLength={6}
						{...form.register('otp')}
					/>
					{form.formState.errors.otp && (
						<p className="text-sm text-destructive">
							{form.formState.errors.otp.message}
						</p>
					)}
				</div>
			)}

			{emailSent && (
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? 'Verifying...' : 'Verify OTP'}
				</Button>
			)}
		</form>
	)
}
