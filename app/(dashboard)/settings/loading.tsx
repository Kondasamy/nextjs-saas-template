import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div>
				<Skeleton className="h-8 w-48 mb-2" />
				<Skeleton className="h-5 w-96" />
			</div>

			{/* Form Skeleton */}
			<div className="rounded-lg border bg-card p-6 space-y-6">
				{/* Form Fields */}
				{[...Array(4)].map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}

				{/* Button */}
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
	)
}
