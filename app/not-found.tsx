import { FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<FileQuestion className="h-5 w-5 text-muted-foreground" />
						<CardTitle>Page not found</CardTitle>
					</div>
					<CardDescription>
						The page you're looking for doesn't exist or has been moved.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<p className="text-6xl font-bold text-muted-foreground/20">404</p>
					</div>
					<Button asChild className="w-full">
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							Back to home
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
