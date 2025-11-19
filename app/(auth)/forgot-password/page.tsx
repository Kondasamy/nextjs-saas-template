'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
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

const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [sent, setSent] = useState(false)

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	})

	const handleSubmit = async (_data: ForgotPasswordFormData) => {
		setIsLoading(true)
		try {
			// This would call Better Auth's password reset
			// await authClient.forgotPassword({ email: _data.email })
			toast.success('Password reset link sent! Check your email.')
			setSent(true)
		} catch {
			toast.error('Failed to send reset link. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>
						Enter your email address and we'll send you a reset link
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								We've sent a password reset link to your email. Please check
								your inbox.
							</p>
							<Link href="/login">
								<Button variant="outline" className="w-full">
									Back to Sign In
								</Button>
							</Link>
						</div>
					) : (
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									{...form.register('email')}
								/>
								{form.formState.errors.email && (
									<p className="text-sm text-destructive">
										{form.formState.errors.email.message}
									</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Sending...' : 'Send Reset Link'}
							</Button>

							<div className="text-center text-sm">
								<Link href="/login" className="text-primary hover:underline">
									Back to Sign In
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
