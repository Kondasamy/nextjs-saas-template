'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp, useSession } from '@/lib/auth/client'
import { trpc } from '@/lib/trpc/client'

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
	const { data: session, refetch: refetchSession } = useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	const ensureDefaultWorkspace = trpc.workspace.ensureDefault.useMutation()

	const signInForm = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
	})

	const signUpForm = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
	})

	const handleSignIn = async (data: SignInFormData) => {
		setIsLoading(true)
		try {
			const result = await signIn.email({
				email: data.email,
				password: data.password,
			})

			// Check if the result has an error
			if (result?.error) {
				toast.error(
					result.error.message ||
						'Failed to sign in. Please check your credentials.'
				)
				setIsLoading(false)
				return
			}

			// Wait a moment for the session to update after sign-in
			await new Promise((resolve) => setTimeout(resolve, 400))

			// Verify authentication by checking the session via API
			// This ensures the user was actually authenticated even if signIn.email() doesn't throw
			let isAuthenticated = false

			try {
				const baseURL =
					process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
				const response = await fetch(`${baseURL}/api/auth/get-session`, {
					method: 'GET',
					credentials: 'include',
				})

				if (response.ok) {
					const sessionData = await response.json()
					// Check various possible response structures from Better Auth
					const user =
						sessionData?.user ??
						sessionData?.data?.user ??
						sessionData?.session?.user
					isAuthenticated = !!user
				} else if (response.status === 401 || response.status === 403) {
					// Explicitly unauthorized
					isAuthenticated = false
				} else {
					// Other error status, assume failure
					isAuthenticated = false
				}
			} catch {
				// If API call fails, try refetching session hook as fallback
				if (refetchSession) {
					try {
						const refetchResult = await refetchSession()
						const refetchSessionData = refetchResult?.data ?? refetchResult
						isAuthenticated = !!refetchSessionData?.user
					} catch {
						// Check current session from hook as last resort
						isAuthenticated = !!session?.user
					}
				} else {
					// Check current session from hook as last resort
					isAuthenticated = !!session?.user
				}
			}

			if (!isAuthenticated) {
				toast.error('Failed to sign in. Please check your credentials.')
				setIsLoading(false)
				return
			}

			toast.success('Signed in successfully')

			// Call onSuccess callback if provided, otherwise redirect
			if (onSuccess) {
				onSuccess()
			} else {
				// Default redirect: check for redirect query param or go to dashboard
				const redirect = searchParams.get('redirect') || '/dashboard'
				router.push(redirect)
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to sign in. Please check your credentials.'
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSignUp = async (data: SignUpFormData) => {
		setIsLoading(true)
		try {
			const result = await signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			})

			// Reset form fields
			signUpForm.reset()

			// Check if email verification is required (production mode)
			const requiresEmailVerification = process.env.NODE_ENV === 'production'

			if (result && !result.error) {
				// Wait a bit for session to be established
				await new Promise((resolve) => setTimeout(resolve, 500))

				// Try to ensure default workspace exists
				try {
					await ensureDefaultWorkspace.mutateAsync()
				} catch (error) {
					// Don't fail signup if workspace creation fails
					console.error('Failed to create default workspace:', error)
				}

				// Check if user is logged in (email verification not required)
				if (!requiresEmailVerification) {
					// Wait for session to be fully established
					await new Promise((resolve) => setTimeout(resolve, 300))

					// Refetch session to check if user is logged in
					const updatedSession = await refetchSession()
					const sessionData = updatedSession?.data ?? updatedSession

					if (sessionData?.user) {
						// User is logged in, redirect to dashboard
						toast.success('Account created successfully!')

						if (onSuccess) {
							onSuccess()
						} else {
							const redirect = searchParams.get('redirect') || '/dashboard'
							router.push(redirect)
						}
						return
					}
				}
			}

			// Email verification required or user not logged in
			if (requiresEmailVerification) {
				toast.success('Account created! Please check your email to verify.')
			} else {
				toast.success('Account created! Please sign in to continue.')
			}

			onSuccess?.()
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to create account. Please try again.'
			toast.error(errorMessage)
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
