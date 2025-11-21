import { Heading, Text } from '@react-email/components'
import { NAME } from '@/lib/constants'
import { EmailLayout } from './components/email-layout'

interface TwoFactorEmailProps {
	name: string
	code: string
}

export default function TwoFactorEmail({ name, code }: TwoFactorEmailProps) {
	return (
		<EmailLayout preview="Your two-factor authentication code">
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				Two-Factor Authentication
			</Heading>
			<Text className="text-sm text-neutral-700">Hello {name},</Text>
			<Text className="text-sm text-neutral-700">
				Here's your two-factor authentication code for {NAME}:
			</Text>
			<Text className="my-4 rounded-lg bg-neutral-100 p-4 text-center text-3xl font-bold tracking-widest text-neutral-900">
				{code}
			</Text>
			<Text className="text-sm text-neutral-700">
				This code will expire in 5 minutes.
			</Text>
			<Text className="text-sm text-neutral-500">
				If you didn't attempt to sign in, please secure your account immediately
				by changing your password.
			</Text>
		</EmailLayout>
	)
}
