'use client'

import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface MaintenanceBannerProps {
	message: string
	endTime?: Date | null
}

export function MaintenanceBanner({
	message,
	endTime,
}: MaintenanceBannerProps) {
	return (
		<Alert
			variant="warning"
			className="border-2 border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-600 shadow-lg"
		>
			<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
			<div className="flex-1">
				<AlertTitle className="text-base font-semibold text-amber-900 dark:text-amber-100">
					System Maintenance
				</AlertTitle>
				<AlertDescription className="text-amber-800 dark:text-amber-200 mt-1">
					<p className="font-medium">{message}</p>
					{endTime && (
						<div className="flex items-center gap-1.5 mt-2 text-sm">
							<Clock className="h-3.5 w-3.5" />
							<span>
								Expected completion:{' '}
								<strong>
									{formatDistanceToNow(endTime, { addSuffix: true })}
								</strong>
							</span>
						</div>
					)}
				</AlertDescription>
			</div>
		</Alert>
	)
}
