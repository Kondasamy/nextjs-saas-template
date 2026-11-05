import { Heading, Text } from 'react-email'
import { NAME } from '@/lib/constants'
import { EmailLayout } from './components/email-layout'

interface TwoFactorEmailProps {
	name: string
	code: string
	// Optional overrides so the same layout serves other one-time codes
	heading?: string
	intro?: string
	warning?: string
}

export default function TwoFactorEmail({
	name,
	code,
	heading = 'Two-Factor Authentication',
	intro = `Here's your two-factor authentication code for ${NAME}:`,
	warning = "If you didn't attempt to sign in, please secure your account immediately by changing your password.",
}: TwoFactorEmailProps) {
	return (
		<EmailLayout preview={heading}>
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				{heading}
			</Heading>
			<Text className="text-sm text-neutral-700">Hello {name},</Text>
			<Text className="text-sm text-neutral-700">{intro}</Text>
			<Text className="my-4 rounded-lg bg-neutral-100 p-4 text-center text-3xl font-bold tracking-widest text-neutral-900">
				{code}
			</Text>
			<Text className="text-sm text-neutral-700">
				This code will expire in 5 minutes.
			</Text>
			<Text className="text-sm text-neutral-500">{warning}</Text>
		</EmailLayout>
	)
}
