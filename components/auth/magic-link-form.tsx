'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const magicLinkSchema = z.object({
	email: z.string().email('Invalid email address'),
})

type MagicLinkFormData = z.infer<typeof magicLinkSchema>

export function MagicLinkForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [sent, setSent] = useState(false)

	const form = useForm<MagicLinkFormData>({
		resolver: zodResolver(magicLinkSchema),
	})

	const handleSubmit = async (data: MagicLinkFormData) => {
		setIsLoading(true)
		try {
			await signIn.magicLink({
				email: data.email,
				callbackURL: '/dashboard',
			})
			setSent(true)
			toast.success('Magic link sent! Check your email.')
		} catch (error) {
			toast.error('Failed to send magic link. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	if (sent) {
		return (
			<div className="text-center space-y-4">
				<p className="text-sm text-muted-foreground">
					We've sent a magic link to your email. Click the link to sign in.
				</p>
			</div>
		)
	}

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
				{isLoading ? 'Sending...' : 'Send Magic Link'}
			</Button>
		</form>
	)
}

