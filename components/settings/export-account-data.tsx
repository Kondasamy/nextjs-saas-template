'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'

export function ExportAccountData() {
	const [isExporting, setIsExporting] = useState(false)

	const exportData = trpc.user.exportAccountData.useMutation({
		onSuccess: (result) => {
			// Create a downloadable JSON file
			const dataStr = JSON.stringify(result.data, null, 2)
			const dataBlob = new Blob([dataStr], { type: 'application/json' })
			const url = URL.createObjectURL(dataBlob)

			// Create download link
			const link = document.createElement('a')
			link.href = url
			link.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)

			// Clean up
			URL.revokeObjectURL(url)

			toast.success('Account data exported successfully')
			setIsExporting(false)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to export account data')
			setIsExporting(false)
		},
	})

	const handleExport = () => {
		setIsExporting(true)
		exportData.mutate()
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Export Your Data</CardTitle>
				<CardDescription>
					Download a copy of all your personal data stored in our system
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">
						Your export will include:
					</p>
					<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
						<li>Profile information (name, email, bio, preferences)</li>
						<li>Workspace memberships and roles</li>
						<li>Recent notifications (last 100)</li>
						<li>Activity history (last 100 entries)</li>
						<li>Active sessions</li>
					</ul>
				</div>

				<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-3">
					<p className="text-xs text-muted-foreground">
						<strong>GDPR Compliance:</strong> This export contains all personal
						data we store about you. The data will be provided in JSON format
						for easy portability.
					</p>
				</div>

				<Button
					onClick={handleExport}
					disabled={isExporting}
					className="w-full"
				>
					{isExporting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Preparing Export...
						</>
					) : (
						<>
							<Download className="mr-2 h-4 w-4" />
							Download My Data
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
