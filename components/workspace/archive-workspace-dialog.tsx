'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Archive, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
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

const archiveSchema = z.object({
	confirmText: z.string(),
})

type ArchiveFormData = z.infer<typeof archiveSchema>

export function ArchiveWorkspaceDialog() {
	const router = useRouter()
	const { currentWorkspace } = useWorkspace()
	const [open, setOpen] = useState(false)

	const form = useForm<ArchiveFormData>({
		resolver: zodResolver(archiveSchema),
		defaultValues: {
			confirmText: '',
		},
	})

	const archiveWorkspace = trpc.workspace.archiveWorkspace.useMutation({
		onSuccess: () => {
			toast.success('Workspace archived successfully')
			setOpen(false)
			form.reset()
			router.push('/')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to archive workspace')
		},
	})

	const handleArchive = (data: ArchiveFormData) => {
		if (!currentWorkspace) {
			toast.error('No workspace selected')
			return
		}

		if (data.confirmText !== currentWorkspace.name) {
			form.setError('confirmText', {
				message: 'Workspace name does not match',
			})
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

				<form onSubmit={form.handleSubmit(handleArchive)} className="space-y-2">
					<Label htmlFor="confirm">
						Type <span className="font-bold">{currentWorkspace.name}</span> to
						confirm
					</Label>
					<Input
						id="confirm"
						placeholder={currentWorkspace.name}
						{...form.register('confirmText')}
						onKeyDown={(e) => {
							if (
								e.key === 'Enter' &&
								form.getValues('confirmText') === currentWorkspace.name
							) {
								form.handleSubmit(handleArchive)()
							}
						}}
					/>
					{form.formState.errors.confirmText && (
						<p className="text-sm text-destructive">
							{form.formState.errors.confirmText.message}
						</p>
					)}
				</form>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							form.handleSubmit(handleArchive)()
						}}
						disabled={
							form.watch('confirmText') !== currentWorkspace.name ||
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
