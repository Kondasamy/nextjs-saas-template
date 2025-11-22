'use client'

import { formatDistanceToNow } from 'date-fns'
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export function ArchivedWorkspacesList() {
	const {
		data: archivedWorkspaces,
		isLoading,
		refetch,
	} = trpc.workspace.listArchived.useQuery()

	const unarchiveWorkspace = trpc.workspace.unarchiveWorkspace.useMutation({
		onSuccess: () => {
			toast.success('Workspace restored successfully')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to restore workspace')
		},
	})

	const handleUnarchive = (organizationId: string) => {
		unarchiveWorkspace.mutate({ organizationId })
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Loading archived workspaces...
			</div>
		)
	}

	if (!archivedWorkspaces || archivedWorkspaces.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
				<Archive className="mb-2 h-8 w-8" />
				<p>No archived workspaces</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{archivedWorkspaces.map((workspace) => (
				<div
					key={workspace.id}
					className="flex items-center justify-between rounded-lg border p-4"
				>
					<div className="flex-1 space-y-1">
						<div className="flex items-center gap-2">
							<h3 className="font-medium">{workspace.name}</h3>
							<span className="text-xs text-muted-foreground">
								({workspace.slug})
							</span>
						</div>
						{workspace.description && (
							<p className="text-sm text-muted-foreground">
								{workspace.description}
							</p>
						)}
						{workspace.archivedAt && (
							<p className="text-xs text-muted-foreground">
								Archived{' '}
								{formatDistanceToNow(new Date(workspace.archivedAt), {
									addSuffix: true,
								})}
							</p>
						)}
					</div>

					<Button
						variant="outline"
						onClick={() => handleUnarchive(workspace.id)}
						disabled={unarchiveWorkspace.isPending}
					>
						{unarchiveWorkspace.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<ArchiveRestore className="mr-2 h-4 w-4" />
						)}
						Restore
					</Button>
				</div>
			))}
		</div>
	)
}
