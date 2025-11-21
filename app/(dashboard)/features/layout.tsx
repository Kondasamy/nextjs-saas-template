'use client'
import { usePathname } from 'next/navigation'

export default function LayoutThing({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const _isMainThingPage = pathname === '/thing'

	return (
		<>
			{/* Main content area with proper spacing and typography */}
			<main className="prose prose-zinc max-w-none dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:prose-base prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium">
				{children}
			</main>
		</>
	)
}
