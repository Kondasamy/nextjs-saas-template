import { Heading, Text } from '@react-email/components'
import { NAME } from '@/lib/constants'
import { EmailButton } from './components/email-button'
import { EmailLayout } from './components/email-layout'

interface PasswordResetEmailProps {
	name: string
	resetUrl: string
}

export default function PasswordResetEmail({
	name,
	resetUrl,
}: PasswordResetEmailProps) {
	return (
		<EmailLayout preview="Reset your password">
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				Reset Your Password
			</Heading>
			<Text className="text-sm text-neutral-700">Hello {name},</Text>
			<Text className="text-sm text-neutral-700">
				We received a request to reset your password for your {NAME} account.
			</Text>
			<Text className="text-center">
				<EmailButton href={resetUrl}>Reset Password</EmailButton>
			</Text>
			<Text className="text-sm text-neutral-700">
				This link will expire in 1 hour for security reasons.
			</Text>
			<Text className="text-sm text-neutral-500">
				If you didn't request a password reset, you can safely ignore this
				email. Your password will remain unchanged.
			</Text>
			<Text className="text-sm text-neutral-700">
				Best regards,
				<br />
				The {NAME} Team
			</Text>
		</EmailLayout>
	)
}
