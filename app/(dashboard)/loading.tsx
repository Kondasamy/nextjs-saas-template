import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
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
						<div className="flex items-center justify-between space-x-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4 rounded" />
						</div>
						<Skeleton className="h-8 w-16 mt-2" />
						<Skeleton className="h-3 w-32 mt-2" />
					</div>
				))}
			</div>

			{/* Charts and Activity Feed Skeleton */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Chart Skeleton */}
				<div className="rounded-lg border bg-card p-6">
					<Skeleton className="h-6 w-32 mb-4" />
					<Skeleton className="h-[300px] w-full" />
				</div>

				{/* Activity Feed Skeleton */}
				<div className="rounded-lg border bg-card p-6">
					<Skeleton className="h-6 w-32 mb-4" />
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-start gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
