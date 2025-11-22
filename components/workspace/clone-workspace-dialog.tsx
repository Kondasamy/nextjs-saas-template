'use client'

import { Copy, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function CloneWorkspaceDialog() {
	const router = useRouter()
	const { currentWorkspace } = useWorkspace()
	const [open, setOpen] = useState(false)
	const [newName, setNewName] = useState('')
	const [newSlug, setNewSlug] = useState('')

	const cloneWorkspace = trpc.workspace.cloneWorkspace.useMutation({
		onSuccess: () => {
			toast.success('Workspace cloned successfully!')
			setOpen(false)
			setNewName('')
			setNewSlug('')
			router.push(`/`)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to clone workspace')
		},
	})

	const handleClone = () => {
		if (!currentWorkspace) {
			toast.error('No workspace selected')
			return
		}

		if (!newName || !newSlug) {
			toast.error('Please provide both name and slug')
			return
		}

		cloneWorkspace.mutate({
			organizationId: currentWorkspace.id,
			newName,
			newSlug,
		})
	}

	// Auto-generate slug from name
	const handleNameChange = (value: string) => {
		setNewName(value)
		if (!newSlug) {
			const slug = value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '')
				.slice(0, 50)
			setNewSlug(slug)
		}
	}

	if (!currentWorkspace) {
		return null
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<Copy className="mr-2 h-4 w-4" />
					Clone Workspace
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Clone Workspace</DialogTitle>
					<DialogDescription>
						Create a copy of this workspace with all roles and permissions.
						Members will not be copied.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<h4 className="text-sm font-medium">What will be cloned:</h4>
						<ul className="space-y-1 text-sm text-muted-foreground">
							<li>✓ Workspace settings (name, description, logo)</li>
							<li>✓ All roles and permissions</li>
							<li>✗ Members (you will be the only owner)</li>
							<li>✗ Invitations</li>
							<li>✗ Activity history</li>
						</ul>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">New Workspace Name</Label>
						<Input
							id="name"
							placeholder={`${currentWorkspace.name} (Copy)`}
							value={newName}
							onChange={(e) => handleNameChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="slug">Workspace Slug</Label>
						<Input
							id="slug"
							placeholder="my-workspace"
							value={newSlug}
							onChange={(e) => setNewSlug(e.target.value)}
							pattern="[a-z0-9-]+"
						/>
						<p className="text-xs text-muted-foreground">
							Only lowercase letters, numbers, and hyphens allowed
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleClone}
						disabled={cloneWorkspace.isPending || !newName || !newSlug}
					>
						{cloneWorkspace.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Clone Workspace
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
