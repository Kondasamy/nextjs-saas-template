import { Button } from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailButtonProps {
	href: string
	children: ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps) {
	return (
		<Button
			href={href}
			className="rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white no-underline"
		>
			{children}
		</Button>
	)
}
