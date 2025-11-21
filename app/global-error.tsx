'use client'

import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Global error:', error)
	}, [error])

	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen items-center justify-center p-4 bg-background">
					<div className="text-center space-y-4">
						<AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
						<h1 className="text-2xl font-bold">Application Error</h1>
						<p className="text-muted-foreground max-w-md">
							A critical error occurred. Please refresh the page or contact
							support if the problem persists.
						</p>
						{process.env.NODE_ENV === 'development' && (
							<pre className="text-left bg-muted p-4 rounded-lg text-sm overflow-auto max-w-2xl">
								{error.message}
							</pre>
						)}
						<button
							onClick={reset}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						>
							Try again
						</button>
					</div>
				</div>
			</body>
		</html>
	)
}
