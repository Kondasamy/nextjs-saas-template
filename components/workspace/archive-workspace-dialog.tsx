'use client'

import { Archive, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function ArchiveWorkspaceDialog() {
	const router = useRouter()
	const { currentWorkspace } = useWorkspace()
	const [open, setOpen] = useState(false)
	const [confirmText, setConfirmText] = useState('')

	const archiveWorkspace = trpc.workspace.archiveWorkspace.useMutation({
		onSuccess: () => {
			toast.success('Workspace archived successfully')
			setOpen(false)
			setConfirmText('')
			router.push('/')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to archive workspace')
		},
	})

	const handleArchive = () => {
		if (!currentWorkspace) {
			toast.error('No workspace selected')
			return
		}

		if (confirmText !== currentWorkspace.name) {
			toast.error('Workspace name does not match')
			return
		}

		archiveWorkspace.mutate({
			organizationId: currentWorkspace.id,
		})
	}

	if (!currentWorkspace) {
		return null
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					<Archive className="mr-2 h-4 w-4" />
					Archive Workspace
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Archive this workspace?</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>
							This will hide the workspace from your workspace switcher and make
							it inaccessible to all members. You can restore it later.
						</p>
						<p className="font-medium text-destructive">
							This action can be undone, but it will temporarily disrupt access
							for all members.
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-2">
					<Label htmlFor="confirm">
						Type <span className="font-bold">{currentWorkspace.name}</span> to
						confirm
					</Label>
					<Input
						id="confirm"
						placeholder={currentWorkspace.name}
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && confirmText === currentWorkspace.name) {
								handleArchive()
							}
						}}
					/>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							handleArchive()
						}}
						disabled={
							confirmText !== currentWorkspace.name ||
							archiveWorkspace.isPending
						}
						className="bg-destructive hover:bg-destructive/90"
					>
						{archiveWorkspace.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Archive Workspace
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
