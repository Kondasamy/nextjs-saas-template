import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div>
				<Skeleton className="h-9 w-48 mb-2" />
				<Skeleton className="h-5 w-64" />
			</div>

			{/* Stats Cards Skeleton */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="rounded-lg border bg-card p-6">
						<Skeleton className="h-4 w-24 mb-2" />
						<Skeleton className="h-8 w-16" />
					</div>
				))}
			</div>

			{/* Table Skeleton */}
			<div className="rounded-lg border bg-card p-6">
				<Skeleton className="h-6 w-32 mb-4" />
				<div className="space-y-3">
					{[...Array(8)].map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			</div>
		</div>
	)
}
