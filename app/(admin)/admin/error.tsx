'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AdminError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Admin error:', error)
	}, [error])

	return (
		<div className="flex flex-1 items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Admin Error</AlertTitle>
					<AlertDescription>
						An error occurred in the admin panel. This has been logged for
						investigation.
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
