'use client'

import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Dashboard error:', error)
	}, [error])

	return (
		<div className="flex flex-1 items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load dashboard content. Please try again or return to the
						homepage.
					</AlertDescription>
				</Alert>

				{process.env.NODE_ENV === 'development' && (
					<div className="rounded-lg bg-muted p-4">
						<p className="text-sm font-mono text-muted-foreground break-all">
							{error.message}
						</p>
						{error.digest && (
							<p className="text-xs text-muted-foreground mt-2">
								Error ID: {error.digest}
							</p>
						)}
					</div>
				)}

				<div className="flex gap-2">
					<Button onClick={reset} variant="outline" className="flex-1">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
					<Button asChild variant="default" className="flex-1">
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							Go home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
