'use client'

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
								<stop
									offset="5%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="date"
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'hsl(var(--card))',
								border: '1px solid hsl(var(--border))',
								borderRadius: '6px',
							}}
						/>
						<Area
							type="monotone"
							dataKey="total"
							stroke="hsl(var(--primary))"
							fillOpacity={1}
							fill="url(#colorTotal)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
