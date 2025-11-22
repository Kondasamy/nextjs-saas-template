import { Img, Section } from '@react-email/components'
import { NAME } from '@/lib/constants'

export function EmailHeader() {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	const logoUrl = `${appUrl}/logo.svg`

	return (
		<Section className="mt-8">
			<Img
				src={logoUrl}
				width="40"
				height="40"
				alt={NAME}
				className="mx-auto my-0"
			/>
		</Section>
	)
}
