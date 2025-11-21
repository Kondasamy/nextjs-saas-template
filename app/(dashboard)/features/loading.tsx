import { Skeleton } from '@/components/ui/skeleton'

export default function FeaturesLoading() {
	return (
		<div className="not-prose">
			<div className="w-full mt-4">
				{/* Tabs and Filter Header Skeleton */}
				<div className="flex justify-between items-center mb-4 flex-wrap gap-4">
					<div className="flex gap-2">
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-10 w-8" />
					</div>
					<Skeleton className="h-9 w-40" />
				</div>

				{/* Feature Cards Grid Skeleton */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
					{[...Array(9)].map((_, i) => (
						<div key={i} className="rounded-lg border bg-card p-4">
							{/* Image Skeleton */}
							<Skeleton className="w-full aspect-video rounded-md mb-4" />

							{/* Card Header Skeleton */}
							<div className="flex items-start justify-between gap-2 mb-2">
								<Skeleton className="h-6 flex-1" />
								<Skeleton className="h-8 w-8 rounded-full" />
							</div>

							{/* Description Skeleton */}
							<div className="space-y-2 mb-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-4/5" />
								<Skeleton className="h-4 w-3/4" />
							</div>

							{/* Tags Skeleton */}
							<div className="flex flex-wrap gap-1.5 mt-2">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-5 w-20" />
								<Skeleton className="h-5 w-14" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
