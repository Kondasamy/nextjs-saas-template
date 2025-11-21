'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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

const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				'Password must contain at least one uppercase letter, one lowercase letter, and one number'
			),
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

export function PasswordChangeForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<PasswordChangeFormData>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const handleSubmit = async (data: PasswordChangeFormData) => {
		try {
			setIsSubmitting(true)

			// Call Better Auth API to change password
			const response = await fetch('/api/auth/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to change password')
			}

			toast.success('Password changed successfully!')
			form.reset()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to change password'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Password</CardTitle>
				<CardDescription>
					Update your password. Make sure it's strong and unique.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="currentPassword">
							Current Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="currentPassword"
							type="password"
							{...form.register('currentPassword')}
							placeholder="Enter current password"
						/>
						{form.formState.errors.currentPassword && (
							<p className="text-sm text-destructive">
								{form.formState.errors.currentPassword.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="newPassword">
							New Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="newPassword"
							type="password"
							{...form.register('newPassword')}
							placeholder="Enter new password"
						/>
						{form.formState.errors.newPassword && (
							<p className="text-sm text-destructive">
								{form.formState.errors.newPassword.message}
							</p>
						)}
						<p className="text-xs text-muted-foreground">
							Must be at least 8 characters with uppercase, lowercase, and number
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm New Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							{...form.register('confirmPassword')}
							placeholder="Confirm new password"
						/>
						{form.formState.errors.confirmPassword && (
							<p className="text-sm text-destructive">
								{form.formState.errors.confirmPassword.message}
							</p>
						)}
					</div>

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Changing Password...
							</>
						) : (
							'Change Password'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
