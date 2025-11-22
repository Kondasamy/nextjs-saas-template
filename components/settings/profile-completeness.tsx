'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'

interface ProfileField {
	label: string
	value: boolean
}

export function ProfileCompleteness() {
	const { data: user } = trpc.user.getCurrent.useQuery()

	if (!user) {
		return null
	}

	// Calculate profile completeness
	const fields: ProfileField[] = [
		{ label: 'Name', value: !!user.name },
		{ label: 'Email', value: !!user.email },
		{ label: 'Profile photo', value: !!user.image },
		{ label: 'Bio', value: !!user.bio },
		{ label: 'Timezone', value: !!user.timezone },
		{ label: 'Language', value: !!user.language },
	]

	const completedFields = fields.filter((field) => field.value).length
	const totalFields = fields.length
	const completionPercentage = Math.round((completedFields / totalFields) * 100)

	// Don't show if profile is complete
	if (completionPercentage === 100) {
		return (
			<Card className="border-green-500/50 bg-green-500/10">
				<CardContent className="pt-6">
					<div className="flex items-center gap-3">
						<CheckCircle2 className="h-6 w-6 text-green-500" />
						<div>
							<p className="font-medium">Profile Complete!</p>
							<p className="text-sm text-muted-foreground">
								Your profile is fully set up.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Completeness</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Progress bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							{completedFields} of {totalFields} completed
						</span>
						<span className="font-medium">{completionPercentage}%</span>
					</div>
					<Progress value={completionPercentage} className="h-2" />
				</div>

				{/* Checklist */}
				<div className="space-y-2">
					<p className="text-sm font-medium">Complete your profile:</p>
					<div className="space-y-1">
						{fields.map((field, index) => (
							<div key={index} className="flex items-center gap-2 text-sm">
								{field.value ? (
									<CheckCircle2 className="h-4 w-4 text-green-500" />
								) : (
									<Circle className="h-4 w-4 text-muted-foreground" />
								)}
								<span
									className={
										field.value ? 'text-muted-foreground' : 'text-foreground'
									}
								>
									{field.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Tip */}
				{completionPercentage < 100 && (
					<div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-3">
						<p className="text-xs text-muted-foreground">
							A complete profile helps your team members recognize and connect
							with you.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
