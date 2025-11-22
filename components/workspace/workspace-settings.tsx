'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

const workspaceSettingsSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	description: z.string().max(500).optional(),
})

type WorkspaceSettingsFormData = z.infer<typeof workspaceSettingsSchema>

export function WorkspaceSettings() {
	const { currentWorkspace, refetchWorkspaces } = useWorkspace()

	const form = useForm<WorkspaceSettingsFormData>({
		resolver: zodResolver(workspaceSettingsSchema),
		defaultValues: {
			name: currentWorkspace?.name || '',
			description: currentWorkspace?.description || '',
		},
	})

	// Update form when workspace changes
	useEffect(() => {
		if (currentWorkspace) {
			form.reset({
				name: currentWorkspace.name,
				description: currentWorkspace.description || '',
			})
		}
	}, [currentWorkspace, form])

	const updateWorkspace = trpc.workspace.update.useMutation({
		onSuccess: () => {
			toast.success('Workspace settings updated successfully')
			refetchWorkspaces()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update workspace settings')
		},
	})

	const handleSubmit = async (data: WorkspaceSettingsFormData) => {
		if (!currentWorkspace) return

		updateWorkspace.mutate({
			id: currentWorkspace.id,
			name: data.name,
			description: data.description || undefined,
		})
	}

	if (!currentWorkspace) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-sm text-muted-foreground">
					No workspace selected. Please select a workspace from the sidebar.
				</p>
			</div>
		)
	}

	const hasPermission =
		currentWorkspace.role.permissions.includes('*') ||
		currentWorkspace.role.permissions.includes('workspace:update')

	if (!hasPermission) {
		return (
			<div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
				<p className="text-sm text-muted-foreground">
					You don't have permission to update workspace settings. Contact your
					workspace owner or admin.
				</p>
			</div>
		)
	}

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">
					Workspace Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id="name"
					{...form.register('name')}
					placeholder="Acme Inc"
					disabled={updateWorkspace.isPending}
				/>
				{form.formState.errors.name && (
					<p className="text-sm text-destructive">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="slug">Workspace Slug</Label>
				<Input
					id="slug"
					value={currentWorkspace.slug}
					disabled
					className="bg-muted"
				/>
				<p className="text-xs text-muted-foreground">
					The workspace slug cannot be changed after creation
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					{...form.register('description')}
					placeholder="A brief description of your workspace..."
					rows={3}
					disabled={updateWorkspace.isPending}
				/>
				{form.formState.errors.description && (
					<p className="text-sm text-destructive">
						{form.formState.errors.description.message}
					</p>
				)}
			</div>

			<Button type="submit" disabled={updateWorkspace.isPending}>
				{updateWorkspace.isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Saving...
					</>
				) : (
					'Save Changes'
				)}
			</Button>
		</form>
	)
}
