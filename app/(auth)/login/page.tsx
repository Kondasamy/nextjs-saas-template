import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { SocialLogin } from '@/components/auth/social-login'
import { MagicLinkForm } from '@/components/auth/magic-link-form'
import { OtpForm } from '@/components/auth/otp-form'
import { PasskeyAuth } from '@/components/auth/passkey-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
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
							<AuthForm mode="signin" />
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
						<Link href="/forgot-password" className="text-primary hover:underline">
							Forgot password?
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

