import { TwoFactorSetup } from '@/components/auth/2fa-setup'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function Setup2FAPage() {
	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Setup Two-Factor Authentication</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TwoFactorSetup />
				</CardContent>
			</Card>
		</div>
	)
}
