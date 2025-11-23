'use client'

import { AlertTriangle, CheckCircle2, Clock, Power } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { MaintenanceStatus } from '@/lib/maintenance/server'
import { trpc } from '@/lib/trpc/client'

type MaintenanceManagerProps = {
	initialStatus: MaintenanceStatus
}

export function MaintenanceManager({ initialStatus }: MaintenanceManagerProps) {
	const [isEnabled, setIsEnabled] = useState(initialStatus.enabled)
	const [message, setMessage] = useState(
		initialStatus.message ||
			'We are currently performing scheduled maintenance.'
	)
	const [endTime, setEndTime] = useState('')
	const [useEndTime, setUseEndTime] = useState(false)

	const utils = trpc.useUtils()

	const enableMutation = trpc.maintenance.enable.useMutation({
		onSuccess: () => {
			toast.success('Maintenance mode enabled', {
				description: 'A banner will now be displayed to all users.',
			})
			utils.maintenance.getStatus.invalidate()
			setIsEnabled(true)

			// Reload the page to show the banner
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		},
		onError: (error) => {
			toast.error('Failed to enable maintenance mode', {
				description: error.message,
			})
		},
	})

	const disableMutation = trpc.maintenance.disable.useMutation({
		onSuccess: () => {
			toast.success('Maintenance mode disabled', {
				description: 'The maintenance banner has been removed.',
			})
			utils.maintenance.getStatus.invalidate()
			setIsEnabled(false)

			// Reload the page to hide the banner
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		},
		onError: (error) => {
			toast.error('Failed to disable maintenance mode', {
				description: error.message,
			})
		},
	})

	const handleEnable = () => {
		const payload: { message?: string; endTime?: Date } = {
			message: message.trim() || undefined,
		}

		if (useEndTime && endTime) {
			payload.endTime = new Date(endTime)
		}

		enableMutation.mutate(payload)
	}

	const handleDisable = () => {
		disableMutation.mutate()
	}

	useEffect(() => {
		if (initialStatus.endTime) {
			setEndTime(new Date(initialStatus.endTime).toISOString().slice(0, 16))
			setUseEndTime(true)
		}
	}, [initialStatus.endTime])

	const isLoading = enableMutation.isPending || disableMutation.isPending

	return (
		<div className="space-y-6">
			{/* Current Status Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{isEnabled ? (
							<>
								<AlertTriangle className="size-5 text-warning" />
								Maintenance Mode Active
							</>
						) : (
							<>
								<CheckCircle2 className="size-5 text-success" />
								System Operating Normally
							</>
						)}
					</CardTitle>
					<CardDescription>
						{isEnabled
							? 'Users are currently seeing a maintenance banner.'
							: 'No maintenance banner is displayed to users.'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isEnabled && initialStatus.message && (
						<div className="rounded-lg border bg-muted/50 p-4">
							<p className="mb-2 text-sm font-medium">Current Message:</p>
							<p className="text-sm text-muted-foreground">
								{initialStatus.message}
							</p>
							{initialStatus.endTime && (
								<p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
									<Clock className="size-3" />
									Scheduled end:{' '}
									{new Date(initialStatus.endTime).toLocaleString()}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Controls Card */}
			<Card>
				<CardHeader>
					<CardTitle>Maintenance Controls</CardTitle>
					<CardDescription>
						Enable or disable maintenance mode and customize the message shown
						to users.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Enable/Disable Section */}
					{!isEnabled ? (
						<>
							{/* Message Input */}
							<div className="space-y-2">
								<Label htmlFor="message">Maintenance Message</Label>
								<Textarea
									id="message"
									placeholder="We are currently performing scheduled maintenance. We'll be back shortly."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									rows={3}
									className="resize-none"
								/>
								<p className="text-xs text-muted-foreground">
									This message will be displayed in the banner to all users.
								</p>
							</div>

							{/* Scheduled End Time */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="use-end-time">Scheduled End Time</Label>
										<p className="text-xs text-muted-foreground">
											Optionally display when maintenance is expected to
											complete
										</p>
									</div>
									<Switch
										id="use-end-time"
										checked={useEndTime}
										onCheckedChange={setUseEndTime}
									/>
								</div>

								{useEndTime && (
									<Input
										type="datetime-local"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
										className="max-w-sm"
									/>
								)}
							</div>

							{/* Enable Button */}
							<Button
								onClick={handleEnable}
								disabled={isLoading}
								className="w-full sm:w-auto"
							>
								<Power className="mr-2 size-4" />
								{isLoading ? 'Enabling...' : 'Enable Maintenance Mode'}
							</Button>
						</>
					) : (
						<>
							{/* Disable Button */}
							<div className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Maintenance mode is currently active. Click the button below
									to disable it and remove the banner.
								</p>
								<Button
									onClick={handleDisable}
									disabled={isLoading}
									variant="destructive"
									className="w-full sm:w-auto"
								>
									<Power className="mr-2 size-4" />
									{isLoading ? 'Disabling...' : 'Disable Maintenance Mode'}
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Info Card */}
			<Card>
				<CardHeader>
					<CardTitle>How It Works</CardTitle>
					<CardDescription>
						Information about the maintenance mode banner system
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 text-sm text-muted-foreground">
						<p>
							When maintenance mode is enabled, a banner will be displayed at
							the top of every page for all users.
						</p>
						<ul className="list-inside list-disc space-y-2">
							<li>The banner is shown site-wide, including public pages</li>
							<li>Users can still access the application normally</li>
							<li>
								The scheduled end time is optional and helps set expectations
							</li>
							<li>All changes are logged in the audit trail</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
