'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/lib/auth/client'

const signInSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signUpSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

interface AuthFormProps {
	mode?: 'signin' | 'signup'
	onSuccess?: () => void
}

export function AuthForm({ mode = 'signin', onSuccess }: AuthFormProps) {
	const [isLoading, setIsLoading] = useState(false)

	const signInForm = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
	})

	const signUpForm = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
	})

	const handleSignIn = async (data: SignInFormData) => {
		setIsLoading(true)
		try {
			await signIn.email({
				email: data.email,
				password: data.password,
			})
			toast.success('Signed in successfully')
			onSuccess?.()
		} catch {
			toast.error('Failed to sign in. Please check your credentials.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSignUp = async (data: SignUpFormData) => {
		setIsLoading(true)
		try {
			await signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			})
			toast.success('Account created! Please check your email to verify.')
			onSuccess?.()
		} catch {
			toast.error('Failed to create account. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	if (mode === 'signin') {
		return (
			<form
				onSubmit={signInForm.handleSubmit(handleSignIn)}
				className="space-y-4"
			>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						{...signInForm.register('email')}
					/>
					{signInForm.formState.errors.email && (
						<p className="text-sm text-destructive">
							{signInForm.formState.errors.email.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						{...signInForm.register('password')}
					/>
					{signInForm.formState.errors.password && (
						<p className="text-sm text-destructive">
							{signInForm.formState.errors.password.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>
		)
	}

	return (
		<form
			onSubmit={signUpForm.handleSubmit(handleSignUp)}
			className="space-y-4"
		>
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="John Doe"
					{...signUpForm.register('name')}
				/>
				{signUpForm.formState.errors.name && (
					<p className="text-sm text-destructive">
						{signUpForm.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					{...signUpForm.register('email')}
				/>
				{signUpForm.formState.errors.email && (
					<p className="text-sm text-destructive">
						{signUpForm.formState.errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					{...signUpForm.register('password')}
				/>
				{signUpForm.formState.errors.password && (
					<p className="text-sm text-destructive">
						{signUpForm.formState.errors.password.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? 'Creating account...' : 'Sign Up'}
			</Button>
		</form>
	)
}
