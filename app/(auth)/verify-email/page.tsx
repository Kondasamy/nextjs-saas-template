import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function VerifyEmailPage() {
	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verify Your Email</CardTitle>
					<CardDescription>
						We've sent a verification link to your email address
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Please check your email and click the verification link to activate
						your account.
					</p>
					<Link href="/login">
						<Button variant="outline" className="w-full">
							Back to Sign In
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}
