import { Heading, Text } from '@react-email/components'
import { NAME } from '@/lib/constants'
import { EmailButton } from './components/email-button'
import { EmailLayout } from './components/email-layout'

interface MagicLinkEmailProps {
	magicLink: string
}

export default function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
	return (
		<EmailLayout preview="Sign in to your account">
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				Sign In to {NAME}
			</Heading>
			<Text className="text-sm text-neutral-700">
				Click the button below to sign in to your {NAME} account. This link will
				only work once.
			</Text>
			<Text className="text-center">
				<EmailButton href={magicLink}>Sign In</EmailButton>
			</Text>
			<Text className="text-sm text-neutral-700">
				This link will expire in 10 minutes for security reasons.
			</Text>
			<Text className="text-sm text-neutral-500">
				If you didn't request this link, you can safely ignore this email.
			</Text>
		</EmailLayout>
	)
}
