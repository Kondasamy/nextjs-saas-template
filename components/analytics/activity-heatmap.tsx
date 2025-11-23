'use client'

import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function ActivityHeatmap() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 30)),
		to: new Date(),
	})

	const { data } = trpc.analytics.getActivityHeatmap.useQuery({
		from: dateRange?.from,
		to: dateRange?.to,
	})

	// Convert data array to Map for O(1) lookups instead of O(n) Array.find()
	const activityMap = useMemo(() => {
		const map = new Map<string, number>()
		data?.forEach((d) => {
			map.set(`${d.dayOfWeek}-${d.hour}`, d.count)
		})
		return map
	}, [data])

	const getIntensityColor = (count: number, max: number) => {
		if (count === 0) return 'bg-muted'
		const intensity = count / max
		if (intensity < 0.25) return 'bg-primary/20'
		if (intensity < 0.5) return 'bg-primary/40'
		if (intensity < 0.75) return 'bg-primary/60'
		return 'bg-primary/80'
	}

	const maxActivity = Math.max(...(data?.map((d) => d.count) || [1]))

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Activity Heatmap</CardTitle>
						<CardDescription>Activity by day and hour</CardDescription>
					</div>
					<DateRangePicker date={dateRange} onDateChange={setDateRange} />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex gap-1">
						<div className="w-12" />
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="flex-1 text-center text-xs text-muted-foreground"
							>
								{hour % 6 === 0 ? hour : ''}
							</div>
						))}
					</div>
					{DAYS.map((day, dayIndex) => (
						<div key={day} className="flex gap-1">
							<div className="w-12 text-xs text-muted-foreground flex items-center">
								{day}
							</div>
							{HOURS.map((hour) => {
								// Use Map lookup (O(1)) instead of Array.find (O(n))
								const count = activityMap.get(`${dayIndex}-${hour}`) ?? 0
								return (
									<div
										key={hour}
										className={cn(
											'flex-1 aspect-square rounded-sm transition-colors hover:ring-2 hover:ring-primary',
											getIntensityColor(count, maxActivity)
										)}
										title={`${day} ${hour}:00 - ${count} activities`}
									/>
								)
							})}
						</div>
					))}
					<div className="flex items-center justify-end gap-2 text-xs text-muted-foreground pt-4">
						<span>Less</span>
						<div className="flex gap-1">
							<div className="w-3 h-3 rounded-sm bg-muted" />
							<div className="w-3 h-3 rounded-sm bg-primary/20" />
							<div className="w-3 h-3 rounded-sm bg-primary/40" />
							<div className="w-3 h-3 rounded-sm bg-primary/60" />
							<div className="w-3 h-3 rounded-sm bg-primary/80" />
						</div>
						<span>More</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
