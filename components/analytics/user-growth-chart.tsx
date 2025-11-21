'use client'

import { useEffect, useState } from 'react'
import {
	Area,
	AreaChart,
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

interface UserGrowthChartProps {
	data: {
		date: string
		new: number
		total: number
	}[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
	const [colors, setColors] = useState({
		chart: '#3b82f6',
		muted: '#6b7280',
		card: '#ffffff',
		border: '#e5e7eb',
	})

	useEffect(() => {
		// Get computed color values from CSS variables
		const root = document.documentElement
		const computedStyle = getComputedStyle(root)

		setColors({
			chart: computedStyle.getPropertyValue('--chart-1').trim(),
			muted: computedStyle.getPropertyValue('--muted-foreground').trim(),
			card: computedStyle.getPropertyValue('--card').trim(),
			border: computedStyle.getPropertyValue('--border').trim(),
		})
	}, [])

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Growth</CardTitle>
				<CardDescription>New users over time</CardDescription>
			</CardHeader>
			<CardContent className="h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
						<defs>
							<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={colors.chart} stopOpacity={0.8} />
								<stop offset="95%" stopColor={colors.chart} stopOpacity={0} />
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
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: colors.card,
								border: `1px solid ${colors.border}`,
								borderRadius: '6px',
							}}
						/>
						<Area
							type="monotone"
							dataKey="total"
							stroke={colors.chart}
							fillOpacity={1}
							fill="url(#colorTotal)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
