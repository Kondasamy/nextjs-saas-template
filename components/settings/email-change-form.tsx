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

const emailChangeSchema = z.object({
	newEmail: z.string().email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required'),
})

type EmailChangeFormData = z.infer<typeof emailChangeSchema>

interface EmailChangeFormProps {
	currentEmail: string
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<EmailChangeFormData>({
		resolver: zodResolver(emailChangeSchema),
		defaultValues: {
			newEmail: '',
			password: '',
		},
	})

	const handleSubmit = async (data: EmailChangeFormData) => {
		try {
			setIsSubmitting(true)

			// Call Better Auth API to change email
			const response = await fetch('/api/auth/update-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					newEmail: data.newEmail,
					password: data.password,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to change email')
			}

			toast.success(
				'Verification email sent! Please check your new email address to confirm the change.'
			)
			form.reset()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to change email'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Email Address</CardTitle>
				<CardDescription>
					Update your email address. You'll need to verify the new email.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="currentEmail">Current Email</Label>
						<Input id="currentEmail" value={currentEmail} disabled />
					</div>

					<div className="space-y-2">
						<Label htmlFor="newEmail">
							New Email <span className="text-destructive">*</span>
						</Label>
						<Input
							id="newEmail"
							type="email"
							{...form.register('newEmail')}
							placeholder="new.email@example.com"
						/>
						{form.formState.errors.newEmail && (
							<p className="text-sm text-destructive">
								{form.formState.errors.newEmail.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							Confirm Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="password"
							type="password"
							{...form.register('password')}
							placeholder="Enter your password"
						/>
						{form.formState.errors.password && (
							<p className="text-sm text-destructive">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Changing Email...
							</>
						) : (
							'Change Email'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
