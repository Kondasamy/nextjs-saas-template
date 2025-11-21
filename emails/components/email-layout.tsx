import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Tailwind,
} from '@react-email/components'
import type { ReactNode } from 'react'
import { EmailFooter } from './email-footer'
import { EmailHeader } from './email-header'

interface EmailLayoutProps {
	preview: string
	children: ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
	return (
		<Html>
			<Head />
			<Preview>{preview}</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white font-sans">
					<Container className="mx-auto my-10 w-[465px] rounded-lg border border-solid border-neutral-200 p-5">
						<EmailHeader />
						<Section className="mt-8">{children}</Section>
						<EmailFooter />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
