import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { SocialLogin } from '@/components/auth/social-login'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function SignUpPage() {
	return (
		<div className="container flex items-center mx-auto justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>Get started with your free account</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthForm mode="signup" />
					<div className="mt-4 relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>
					<div className="mt-4">
						<SocialLogin />
					</div>
					<div className="mt-4 text-center text-sm">
						Already have an account?{' '}
						<Link href="/login" className="text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
