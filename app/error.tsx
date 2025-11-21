'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Application error:', error)
	}, [error])

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<CardTitle>Something went wrong</CardTitle>
					</div>
					<CardDescription>
						An unexpected error occurred. Please try again.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{process.env.NODE_ENV === 'development' && (
						<div className="rounded-lg bg-muted p-4">
							<p className="text-sm font-mono text-muted-foreground">
								{error.message}
							</p>
							{error.digest && (
								<p className="text-xs text-muted-foreground mt-2">
									Error ID: {error.digest}
								</p>
							)}
						</div>
					)}
					<Button onClick={reset} className="w-full">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
