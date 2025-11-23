'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const token = searchParams.get('token')

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	})

	const handleSubmit = async (data: ResetPasswordFormData) => {
		if (!token) {
			toast.error('Invalid or missing reset token')
			return
		}

		setIsLoading(true)
		try {
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token,
			})

			if (result?.error) {
				toast.error(result.error.message || 'Failed to reset password')
				setIsLoading(false)
				return
			}

			toast.success('Password reset successfully! You can now sign in.')
			router.push('/login')
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to reset password. Please try again.'
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	if (!token) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Invalid Link</CardTitle>
						<CardDescription>
							This password reset link is invalid or has expired.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/forgot-password')}
						>
							Request New Reset Link
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>Enter your new password below</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter new password"
								{...form.register('password')}
							/>
							{form.formState.errors.password && (
								<p className="text-sm text-destructive">
									{form.formState.errors.password.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm new password"
								{...form.register('confirmPassword')}
							/>
							{form.formState.errors.confirmPassword && (
								<p className="text-sm text-destructive">
									{form.formState.errors.confirmPassword.message}
								</p>
							)}
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle>Loading...</CardTitle>
							<CardDescription>Please wait</CardDescription>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	)
}
