import { Heading, Text } from '@react-email/components'
import { EmailLayout } from './components/email-layout'

interface SupportEmailProps {
	userName: string
	userEmail: string
	subject: string
	priority: string
	message: string
}

export default function SupportEmail({
	userName,
	userEmail,
	subject,
	priority,
	message,
}: SupportEmailProps) {
	return (
		<EmailLayout preview={`Support request from ${userName}`}>
			<Heading className="mx-0 my-8 p-0 text-center text-2xl font-bold text-neutral-900">
				New Support Request
			</Heading>
			<Text className="text-sm text-neutral-700">
				<strong>From:</strong> {userName} ({userEmail})
			</Text>
			<Text className="text-sm text-neutral-700">
				<strong>Subject:</strong> {subject}
			</Text>
			<Text className="text-sm text-neutral-700">
				<strong>Priority:</strong>{' '}
				<span
					className={
						priority === 'High'
							? 'text-red-600'
							: priority === 'Medium'
								? 'text-orange-600'
								: 'text-neutral-600'
					}
				>
					{priority}
				</span>
			</Text>
			<Text className="text-sm text-neutral-700">
				<strong>Message:</strong>
			</Text>
			<Text className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
				{message}
			</Text>
			<Text className="text-xs text-neutral-500">
				This support request was submitted through the application support form.
			</Text>
		</EmailLayout>
	)
}
