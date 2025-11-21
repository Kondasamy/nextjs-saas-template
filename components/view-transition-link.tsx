'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode } from 'react'

interface ViewTransitionLinkProps extends LinkProps {
	children: ReactNode
	className?: string
}

export function ViewTransitionLink({
	children,
	href,
	className,
	...props
}: ViewTransitionLinkProps) {
	const router = useRouter()

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()

		// Check if browser supports View Transitions API
		if ('startViewTransition' in document) {
			;(document as any).startViewTransition(() => {
				router.push(href.toString())
			})
		} else {
			// Fallback for browsers without View Transitions support
			router.push(href.toString())
		}
	}

	return (
		<Link href={href} onClick={handleClick} className={className} {...props}>
			{children}
		</Link>
	)
}
