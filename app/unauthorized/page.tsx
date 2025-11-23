import { Home, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function UnauthorizedPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<ShieldAlert className="h-5 w-5 text-destructive" />
						<CardTitle>Access denied</CardTitle>
					</div>
					<CardDescription>
						You don't have permission to access this page. Please contact your
						administrator if you believe this is an error.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<p className="text-6xl font-bold text-muted-foreground/20">403</p>
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
