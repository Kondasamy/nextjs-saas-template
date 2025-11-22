'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

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
			setPreviewImage(user.image ?? null)
		}
	}, [user, form])

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image size must be less than 5MB')
			return
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload an image file')
			return
		}

		try {
			setIsUploading(true)

			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviewImage(reader.result as string)
			}
			reader.readAsDataURL(file)

			// TODO: Upload to storage (Supabase/S3)
			// For now, using a placeholder. In production, you'd upload to your storage service
			// const uploadUrl = await uploadToStorage(file)
			// form.setValue('image', uploadUrl)

			toast.info('Image upload will be implemented with storage backend')
		} catch (error) {
			toast.error('Failed to upload image')
			console.error(error)
		} finally {
			setIsUploading(false)
		}
	}

	const handleSubmit = async (data: ProfileFormData) => {
		updateProfile.mutate(data)
	}

	const userInitial = user?.name?.[0] || user?.email?.[0] || '?'

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
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={previewImage || user?.image || undefined} />
							<AvatarFallback className="text-2xl">
								{userInitial.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageUpload}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}
							>
								{isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Upload Photo
									</>
								)}
							</Button>
							<p className="mt-2 text-xs text-muted-foreground">
								JPG, PNG or GIF. Max 5MB.
							</p>
						</div>
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
