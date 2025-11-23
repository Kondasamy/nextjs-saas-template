'use client'

import { toast } from 'sonner'
import { ImageUpload } from '@/components/upload/image-upload'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function WorkspaceLogoUpload() {
	const { currentWorkspace, refetchWorkspaces } = useWorkspace()

	const updateWorkspace = trpc.workspace.update.useMutation({
		onSuccess: () => {
			toast.success('Workspace logo updated successfully')
			refetchWorkspaces()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update workspace logo')
		},
	})

	const handleLogoChange = async (url: string) => {
		if (!currentWorkspace) return

		await updateWorkspace.mutateAsync({
			id: currentWorkspace.id,
			logo: url,
		})
	}

	return (
		<div className="space-y-4">
			<ImageUpload
				bucket="workspace-logos"
				path={`${currentWorkspace?.id}/logo`}
				value={currentWorkspace?.logo || ''}
				onChange={handleLogoChange}
			/>

			<div className="space-y-2">
				<p className="text-sm font-medium">Requirements:</p>
				<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>Square images work best (e.g., 512x512px)</li>
					<li>Maximum file size: 5MB</li>
					<li>Supported formats: PNG, JPG, WebP, GIF</li>
					<li>Logo will be displayed at 32x32px in the workspace switcher</li>
				</ul>
			</div>
		</div>
	)
}
