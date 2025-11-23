'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { MagicLinkForm } from '@/components/auth/magic-link-form'
import { OtpForm } from '@/components/auth/otp-form'
import { PasskeyAuth } from '@/components/auth/passkey-auth'
import { SocialLogin } from '@/components/auth/social-login'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function LoginContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const redirect = searchParams.get('redirect') || '/'

	const handleSuccess = () => {
		router.push(redirect)
	}
	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>
						Choose your preferred sign-in method
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="email" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="email">Email</TabsTrigger>
							<TabsTrigger value="magic">Magic Link</TabsTrigger>
							<TabsTrigger value="otp">OTP</TabsTrigger>
							<TabsTrigger value="passkey">Passkey</TabsTrigger>
						</TabsList>
						<TabsContent value="email" className="space-y-4">
							<AuthForm mode="signin" onSuccess={handleSuccess} />
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
							<SocialLogin />
						</TabsContent>
						<TabsContent value="magic">
							<MagicLinkForm />
						</TabsContent>
						<TabsContent value="otp">
							<OtpForm />
						</TabsContent>
						<TabsContent value="passkey">
							<PasskeyAuth />
						</TabsContent>
					</Tabs>
					<div className="mt-4 text-center text-sm">
						Don't have an account?{' '}
						<Link href="/signup" className="text-primary hover:underline">
							Sign up
						</Link>
					</div>
					<div className="mt-2 text-center text-sm">
						<Link
							href="/forgot-password"
							className="text-primary hover:underline"
						>
							Forgot password?
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto flex items-center justify-center min-h-screen">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	)
}
