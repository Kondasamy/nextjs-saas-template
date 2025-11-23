import { Heading, Text } from '@react-email/components'
import { EmailLayout } from './components/email-layout'

interface FeedbackEmailProps {
	userName: string
	userEmail: string
	category: string
	message: string
}

export default function FeedbackEmail({
	userName,
	userEmail,
	category,
	message,
}: FeedbackEmailProps) {
	return (
		<EmailLayout preview={`New feedback from ${userName}`}>
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				New Feedback Received
			</Heading>
			<Text className="text-sm text-neutral-700">
				<strong>From:</strong> {userName} ({userEmail})
			</Text>
			<Text className="text-sm text-neutral-700">
				<strong>Category:</strong> {category}
			</Text>
			<Text className="text-sm text-neutral-700">
				<strong>Message:</strong>
			</Text>
			<Text className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
				{message}
			</Text>
			<Text className="text-xs text-neutral-500">
				This feedback was submitted through the application feedback form.
			</Text>
		</EmailLayout>
	)
}
