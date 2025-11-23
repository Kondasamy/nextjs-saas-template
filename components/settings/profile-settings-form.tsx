'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/upload/image-upload'
import { trpc } from '@/lib/trpc/client'

const profileSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	image: z.string().url().optional().or(z.literal('')),
	bio: z.string().max(500).optional(),
	timezone: z.string().optional(),
	language: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Common timezones
const TIMEZONES = [
	{ value: 'America/New_York', label: 'Eastern Time (ET)' },
	{ value: 'America/Chicago', label: 'Central Time (CT)' },
	{ value: 'America/Denver', label: 'Mountain Time (MT)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
	{ value: 'Europe/London', label: 'London (GMT)' },
	{ value: 'Europe/Paris', label: 'Paris (CET)' },
	{ value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
	{ value: 'Asia/Dubai', label: 'Dubai (GST)' },
	{ value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

// Supported languages
const LANGUAGES = [
	{ value: 'en', label: 'English' },
	{ value: 'es', label: 'Español' },
	{ value: 'fr', label: 'Français' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'ja', label: '日本語' },
	{ value: 'zh', label: '中文' },
]

export function ProfileSettingsForm() {
	const { data: user } = trpc.user.getCurrent.useQuery()
	const utils = trpc.useUtils()

	const updateProfile = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			toast.success('Profile updated successfully')
			utils.user.getCurrent.invalidate()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update profile')
		},
	})

	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: '',
			image: '',
			bio: '',
			timezone: '',
			language: 'en',
		},
	})

	// Update form when user data loads
	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name ?? '',
				image: user.image ?? '',
				bio: user.bio ?? '',
				timezone: user.timezone ?? '',
				language: user.language ?? 'en',
			})
		}
	}, [user, form])

	const handleImageChange = (url: string) => {
		form.setValue('image', url)
	}

	const handleSubmit = async (data: ProfileFormData) => {
		updateProfile.mutate(data)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
				<CardDescription>
					Update your profile information and preferences
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* Avatar Upload */}
					<div className="space-y-2">
						<Label>Profile Photo</Label>
						<ImageUpload
							bucket="avatars"
							path={`${user?.id}/avatar`}
							value={form.watch('image')}
							onChange={handleImageChange}
						/>
						<p className="text-xs text-muted-foreground">
							JPG, PNG, GIF, or WEBP. Max 5MB.
						</p>
					</div>

					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name">
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							{...form.register('name')}
							placeholder="Your name"
						/>
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>

					{/* Email (read-only) */}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" value={user?.email ?? ''} disabled />
						<p className="text-xs text-muted-foreground">
							Email cannot be changed here. Go to Account settings to update.
						</p>
					</div>

					{/* Bio */}
					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							{...form.register('bio')}
							placeholder="Tell us about yourself..."
							rows={4}
						/>
						<p className="text-xs text-muted-foreground">
							Brief description for your profile. Max 500 characters.
						</p>
					</div>

					{/* Timezone */}
					<div className="space-y-2">
						<Label htmlFor="timezone">Timezone</Label>
						<Select
							value={form.watch('timezone')}
							onValueChange={(value) => form.setValue('timezone', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select your timezone" />
							</SelectTrigger>
							<SelectContent>
								{TIMEZONES.map((tz) => (
									<SelectItem key={tz.value} value={tz.value}>
										{tz.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Language */}
					<div className="space-y-2">
						<Label htmlFor="language">Language</Label>
						<Select
							value={form.watch('language')}
							onValueChange={(value) => form.setValue('language', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select your language" />
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((lang) => (
									<SelectItem key={lang.value} value={lang.value}>
										{lang.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end">
						<Button type="submit" disabled={updateProfile.isPending}>
							{updateProfile.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
