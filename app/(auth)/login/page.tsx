'use client'

import { Check, Copy } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { MagicLinkForm } from '@/components/auth/magic-link-form'
import { OtpForm } from '@/components/auth/otp-form'
import { PasskeyAuth } from '@/components/auth/passkey-auth'
import { SocialLogin } from '@/components/auth/social-login'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DEMO_EMAIL = 'demo@saastemplate.com'
const DEMO_PASSWORD = 'demo1234'

function DemoCredentialsBanner() {
	const [copiedEmail, setCopiedEmail] = useState(false)
	const [copiedPassword, setCopiedPassword] = useState(false)

	const copyToClipboard = async (text: string, type: 'email' | 'password') => {
		await navigator.clipboard.writeText(text)
		if (type === 'email') {
			setCopiedEmail(true)
			setTimeout(() => setCopiedEmail(false), 2000)
		} else {
			setCopiedPassword(true)
			setTimeout(() => setCopiedPassword(false), 2000)
		}
	}

	return (
		<Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
			<AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">
				Demo Mode
			</AlertTitle>
			<AlertDescription className="text-blue-700 dark:text-blue-300">
				<p className="mb-2">
					Try out all features with the demo admin account:
				</p>
				<div className="space-y-2 font-mono text-sm">
					<div className="flex items-center justify-between bg-white dark:bg-blue-900 rounded px-3 py-2">
						<span>
							<span className="text-muted-foreground">Email:</span> {DEMO_EMAIL}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={() => copyToClipboard(DEMO_EMAIL, 'email')}
						>
							{copiedEmail ? (
								<Check className="h-3 w-3 text-green-600" />
							) : (
								<Copy className="h-3 w-3" />
							)}
						</Button>
					</div>
					<div className="flex items-center justify-between bg-white dark:bg-blue-900 rounded px-3 py-2">
						<span>
							<span className="text-muted-foreground">Password:</span>{' '}
							{DEMO_PASSWORD}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={() => copyToClipboard(DEMO_PASSWORD, 'password')}
						>
							{copiedPassword ? (
								<Check className="h-3 w-3 text-green-600" />
							) : (
								<Copy className="h-3 w-3" />
							)}
						</Button>
					</div>
				</div>
			</AlertDescription>
		</Alert>
	)
}

function LoginContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const redirect = searchParams.get('redirect') || '/'

	const handleSuccess = () => {
		router.push(redirect)
	}
	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen py-12">
			<div className="w-full max-w-md">
				<DemoCredentialsBanner />
				<Card className="w-full">
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
