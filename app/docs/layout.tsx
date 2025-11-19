'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LayoutTutorial({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const isMainTutorialPage = pathname === '/tutorial'
	const [_copied, setCopied] = useState<boolean>(false)
	const [_title, setTitle] = useState<string>('')

	// Extract title from path for detail pages
	useEffect(() => {
		if (!isMainTutorialPage && pathname) {
			const pathSegments = pathname.split('/')
			const slug = pathSegments[pathSegments.length - 1]
			const formattedTitle = slug
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
			setTitle(formattedTitle)
		} else {
			setTitle('Tutorials')
		}
	}, [pathname, isMainTutorialPage])

	const _handleCopy = () => {
		const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
		navigator.clipboard.writeText(currentUrl)
		setCopied(true)
		toast.success('URL copied to clipboard')
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<>
			{/* Main content area with proper spacing and typography */}
			<main className="w-full prose prose-zinc max-w-none dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:prose-base prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium">
				{!isMainTutorialPage ? (
					<div className="w-full rounded-lg overflow-hidden border bg-muted">
						<div className="p-6">{children}</div>
					</div>
				) : (
					<>{children}</>
				)}
			</main>
		</>
	)
}
