import { OtpForm } from '@/components/auth/otp-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyOtpPage() {
	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verify OTP</CardTitle>
					<CardDescription>
						Enter the one-time password sent to your email
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OtpForm />
				</CardContent>
			</Card>
		</div>
	)
}

