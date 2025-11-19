'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { trpc } from '@/lib/trpc/client'

const profileSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	image: z.string().url().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileSettingsForm() {
	const { data: user } = trpc.user.getCurrent.useQuery()
	const utils = trpc.useUtils()
	const updateProfile = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			toast.success('Profile updated successfully')
			utils.user.getCurrent.invalidate()
		},
		onError: () => {
			toast.error('Failed to update profile')
		},
	})

	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name ?? '',
			image: user?.image ?? '',
		},
	})

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
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							{...form.register('name')}
							placeholder="Your name"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="image">Profile Image URL</Label>
						<Input
							id="image"
							type="url"
							{...form.register('image')}
							placeholder="https://example.com/avatar.jpg"
						/>
					</div>

					<Button type="submit" disabled={updateProfile.isPending}>
						{updateProfile.isPending ? 'Saving...' : 'Save Changes'}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
