'use client'

import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { getChartColors } from '@/lib/chart-utils'
import { trpc } from '@/lib/trpc/client'

export function RevenueChart() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 30)),
		to: new Date(),
	})

	const { data } = trpc.analytics.getRevenue.useQuery({
		from: dateRange?.from,
		to: dateRange?.to,
	})

	// Use shared chart colors utility with caching
	const colors = useMemo(() => getChartColors(), [])

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Revenue Overview</CardTitle>
						<CardDescription>Daily revenue trends</CardDescription>
					</div>
					<DateRangePicker date={dateRange} onDateChange={setDateRange} />
				</div>
			</CardHeader>
			<CardContent className="h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data || []}>
						<defs>
							<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={colors.chart2} stopOpacity={0.8} />
								<stop
									offset="95%"
									stopColor={colors.chart2}
									stopOpacity={0.3}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="date"
							stroke={colors.muted}
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke={colors.muted}
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `$${value}`}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: colors.card,
								border: `1px solid ${colors.border}`,
								borderRadius: '6px',
							}}
							formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
						/>
						<Bar
							dataKey="revenue"
							fill="url(#colorRevenue)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
