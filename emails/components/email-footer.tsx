import { Hr, Link, Section, Text } from '@react-email/components'
import { EMAIL_URL, NAME } from '@/lib/constants'

export function EmailFooter() {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	const year = new Date().getFullYear()

	return (
		<>
			<Hr className="mx-0 my-6 w-full border border-solid border-neutral-200" />
			<Section>
				<Text className="text-xs text-neutral-500">
					This email was sent by {NAME}. If you have any questions, please
					contact us at{' '}
					<Link
						href={`mailto:${EMAIL_URL}`}
						className="text-neutral-700 underline"
					>
						{EMAIL_URL}
					</Link>
					.
				</Text>
				<Text className="text-xs text-neutral-500">
					<Link href={appUrl} className="text-neutral-700 underline">
						Visit our website
					</Link>{' '}
					|{' '}
					<Link
						href={`${appUrl}/settings/notifications`}
						className="text-neutral-700 underline"
					>
						Email preferences
					</Link>
				</Text>
				<Text className="text-xs text-neutral-500">
					© {year} {NAME}. All rights reserved.
				</Text>
			</Section>
		</>
	)
}
