'use client'

import { AlertTriangle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ImpersonationBannerProps {
	targetUserEmail: string
	adminEmail: string
}

export function ImpersonationBanner({
	targetUserEmail,
	adminEmail,
}: ImpersonationBannerProps) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const handleStopImpersonation = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/admin/impersonation/stop', {
				method: 'POST',
			})

			if (!response.ok) {
				throw new Error('Failed to stop impersonation')
			}

			toast.success('Impersonation ended')
			router.push('/admin/users')
			router.refresh()
		} catch (error) {
			console.error('Error stopping impersonation:', error)
			toast.error('Failed to stop impersonation')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Alert variant="warning" className="mb-4">
			<AlertTriangle className="h-4 w-4" />
			<div className="flex items-center justify-between flex-1">
				<div>
					<AlertTitle>Impersonation Mode Active</AlertTitle>
					<AlertDescription>
						You are viewing as <strong>{targetUserEmail}</strong>. Admin:{' '}
						{adminEmail}
					</AlertDescription>
				</div>
				<Button
					onClick={handleStopImpersonation}
					disabled={loading}
					variant="outline"
					size="sm"
				>
					<LogOut className="mr-2 h-4 w-4" />
					Exit Impersonation
				</Button>
			</div>
		</Alert>
	)
}
