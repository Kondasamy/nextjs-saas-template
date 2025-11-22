'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'

function VerifyEmailChangeContent() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
		'verifying'
	)
	const [message, setMessage] = useState('')

	const confirmEmailChange = trpc.user.confirmEmailChange.useMutation({
		onSuccess: (data) => {
			setStatus('success')
			setMessage(data.message)
		},
		onError: (error) => {
			setStatus('error')
			setMessage(error.message || 'Failed to verify email change')
		},
	})

	useEffect(() => {
		if (token) {
			confirmEmailChange.mutate({ token })
		} else {
			setStatus('error')
			setMessage('Invalid verification link')
		}
	}, [token])

	return (
		<div className="container flex min-h-screen items-center justify-center py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Email Verification</CardTitle>
					<CardDescription>
						{status === 'verifying' && 'Verifying your new email address...'}
						{status === 'success' && 'Email verified successfully!'}
						{status === 'error' && 'Verification failed'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex justify-center">
							{status === 'verifying' && (
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							)}
							{status === 'success' && (
								<CheckCircle2 className="h-12 w-12 text-green-500" />
							)}
							{status === 'error' && (
								<XCircle className="h-12 w-12 text-destructive" />
							)}
						</div>

						<p className="text-center text-sm text-muted-foreground">
							{message}
						</p>

						{status === 'success' && (
							<div className="space-y-2">
								<p className="text-center text-sm text-muted-foreground">
									For security reasons, all your sessions have been logged out.
									Please sign in again with your new email address.
								</p>
								<Button className="w-full" asChild>
									<Link href="/auth/login">Sign In</Link>
								</Button>
							</div>
						)}

						{status === 'error' && (
							<div className="space-y-2">
								<Button className="w-full" variant="outline" asChild>
									<Link href="/settings/account">Go to Account Settings</Link>
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function VerifyEmailChangePage() {
	return (
		<Suspense
			fallback={
				<div className="container flex min-h-screen items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<VerifyEmailChangeContent />
		</Suspense>
	)
}
