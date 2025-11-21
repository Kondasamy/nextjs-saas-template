'use client'

import { Loader2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

interface NotificationPreference {
	id: string
	label: string
	description: string
	email: boolean
	inApp: boolean
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
	{
		id: 'team_invites',
		label: 'Team Invitations',
		description: 'When someone invites you to join a workspace',
		email: true,
		inApp: true,
	},
	{
		id: 'member_joined',
		label: 'New Team Members',
		description: 'When a new member joins your workspace',
		email: true,
		inApp: true,
	},
	{
		id: 'role_changed',
		label: 'Role Changes',
		description: 'When your role in a workspace is changed',
		email: true,
		inApp: true,
	},
	{
		id: 'workspace_updates',
		label: 'Workspace Updates',
		description: 'Important updates about your workspaces',
		email: true,
		inApp: true,
	},
	{
		id: 'security_alerts',
		label: 'Security Alerts',
		description: 'Suspicious activity or security-related notifications',
		email: true,
		inApp: true,
	},
	{
		id: 'product_updates',
		label: 'Product Updates',
		description: 'News about new features and improvements',
		email: false,
		inApp: true,
	},
	{
		id: 'marketing',
		label: 'Marketing Emails',
		description: 'Tips, case studies, and promotional content',
		email: false,
		inApp: false,
	},
]

export function NotificationPreferences() {
	const [preferences, setPreferences] =
		useState<NotificationPreference[]>(DEFAULT_PREFERENCES)
	const [isSaving, setIsSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Load user preferences (would use tRPC in production)
	useEffect(() => {
		// TODO: Load from API
		// const loadedPrefs = await trpc.user.getNotificationPreferences.query()
		// setPreferences(loadedPrefs)
	}, [])

	const handleToggle = (
		id: string,
		type: 'email' | 'inApp',
		value: boolean
	) => {
		setPreferences((prev) =>
			prev.map((pref) =>
				pref.id === id ? { ...pref, [type]: value } : pref
			)
		)
		setHasChanges(true)
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			// TODO: Save to API
			// await trpc.user.updateNotificationPreferences.mutate(preferences)

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000))

			toast.success('Notification preferences saved successfully')
			setHasChanges(false)
		} catch (error) {
			toast.error('Failed to save preferences')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Email Notifications</CardTitle>
					<CardDescription>
						Choose which notifications you want to receive via email
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{preferences.map((pref, index) => (
						<div key={pref.id}>
							<div className="flex items-center justify-between space-x-4">
								<div className="flex-1 space-y-1">
									<Label htmlFor={`${pref.id}-email`} className="text-base">
										{pref.label}
									</Label>
									<p className="text-sm text-muted-foreground">
										{pref.description}
									</p>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Label
											htmlFor={`${pref.id}-email`}
											className="text-sm font-normal"
										>
											Email
										</Label>
										<Switch
											id={`${pref.id}-email`}
											checked={pref.email}
											onCheckedChange={(checked) =>
												handleToggle(pref.id, 'email', checked)
											}
										/>
									</div>
									<div className="flex items-center gap-2">
										<Label
											htmlFor={`${pref.id}-inapp`}
											className="text-sm font-normal"
										>
											In-App
										</Label>
										<Switch
											id={`${pref.id}-inapp`}
											checked={pref.inApp}
											onCheckedChange={(checked) =>
												handleToggle(pref.id, 'inApp', checked)
											}
										/>
									</div>
								</div>
							</div>
							{index < preferences.length - 1 && (
								<Separator className="mt-6" />
							)}
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Digest Emails</CardTitle>
					<CardDescription>
						Receive a summary of notifications at regular intervals
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="daily-digest" className="text-base">
								Daily Digest
							</Label>
							<p className="text-sm text-muted-foreground">
								Receive a daily summary of your notifications
							</p>
						</div>
						<Switch id="daily-digest" />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="weekly-digest" className="text-base">
								Weekly Digest
							</Label>
							<p className="text-sm text-muted-foreground">
								Receive a weekly summary of workspace activity
							</p>
						</div>
						<Switch id="weekly-digest" />
					</div>
				</CardContent>
			</Card>

			{hasChanges && (
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setPreferences(DEFAULT_PREFERENCES)
							setHasChanges(false)
						}}
					>
						Reset
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							'Save Changes'
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
