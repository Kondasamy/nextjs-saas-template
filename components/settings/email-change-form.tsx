'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { trpc } from '@/lib/trpc/client'

const emailChangeSchema = z.object({
	newEmail: z.string().email('Please enter a valid email address'),
})

type EmailChangeFormData = z.infer<typeof emailChangeSchema>

interface EmailChangeFormProps {
	currentEmail: string
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
	const form = useForm<EmailChangeFormData>({
		resolver: zodResolver(emailChangeSchema),
		defaultValues: {
			newEmail: '',
		},
	})

	const requestEmailChange = trpc.user.requestEmailChange.useMutation({
		onSuccess: () => {
			toast.success(
				'Verification email sent! Please check your new email address to confirm the change.'
			)
			form.reset()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to request email change')
		},
	})

	const handleSubmit = async (data: EmailChangeFormData) => {
		requestEmailChange.mutate({ newEmail: data.newEmail })
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

					<Button type="submit" disabled={requestEmailChange.isPending}>
						{requestEmailChange.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending Verification...
							</>
						) : (
							'Send Verification Email'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
