'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function WorkspaceSwitcher() {
	const router = useRouter()
	const { currentWorkspace, workspaces, switchWorkspace, isLoading } =
		useWorkspace()
	const [open, setOpen] = useState(false)
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [newWorkspaceName, setNewWorkspaceName] = useState('')
	const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('')

	const createWorkspace = trpc.workspace.create.useMutation({
		onSuccess: (data) => {
			toast.success('Workspace created successfully')
			setShowCreateDialog(false)
			setNewWorkspaceName('')
			setNewWorkspaceSlug('')
			switchWorkspace(data.id)
			router.refresh()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to create workspace')
		},
	})

	const handleCreateWorkspace = () => {
		if (!newWorkspaceName.trim() || !newWorkspaceSlug.trim()) {
			toast.error('Please provide both name and slug')
			return
		}

		createWorkspace.mutate({
			name: newWorkspaceName,
			slug: newWorkspaceSlug,
		})
	}

	const handleWorkspaceSelect = (workspaceId: string) => {
		switchWorkspace(workspaceId)
		setOpen(false)
		router.refresh()
	}

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		setNewWorkspaceName(name)
		if (!newWorkspaceSlug) {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '')
			setNewWorkspaceSlug(slug)
		}
	}

	if (isLoading || !currentWorkspace) {
		return (
			<div className="flex items-center gap-2 px-2 py-1.5">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
				<div className="flex-1 space-y-1">
					<div className="h-3 w-24 animate-pulse rounded bg-muted" />
					<div className="h-2 w-16 animate-pulse rounded bg-muted" />
				</div>
			</div>
		)
	}

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between px-2"
					>
						<div className="flex items-center gap-2 overflow-hidden">
							<Avatar className="h-8 w-8">
								<AvatarImage src={currentWorkspace.logo || undefined} />
								<AvatarFallback>
									{currentWorkspace.name[0]?.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start overflow-hidden">
								<span className="truncate text-sm font-medium">
									{currentWorkspace.name}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									{currentWorkspace.role.name}
								</span>
							</div>
						</div>
						<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[250px] p-0" align="start">
					<Command>
						<CommandInput placeholder="Search workspaces..." />
						<CommandList>
							<CommandEmpty>No workspace found.</CommandEmpty>
							<CommandGroup heading="Workspaces">
								{workspaces.map((workspace) => (
									<CommandItem
										key={workspace.id}
										value={workspace.name}
										onSelect={() => handleWorkspaceSelect(workspace.id)}
										className="gap-2"
									>
										<Avatar className="h-6 w-6">
											<AvatarImage src={workspace.logo || undefined} />
											<AvatarFallback className="text-xs">
												{workspace.name[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-1 flex-col overflow-hidden">
											<span className="truncate text-sm">{workspace.name}</span>
											<span className="truncate text-xs text-muted-foreground">
												{workspace.role.name}
											</span>
										</div>
										{currentWorkspace.id === workspace.id && (
											<Check className="h-4 w-4 shrink-0" />
										)}
									</CommandItem>
								))}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup>
								<CommandItem
									onSelect={() => {
										setOpen(false)
										setShowCreateDialog(true)
									}}
									className="gap-2"
								>
									<div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed">
										<Plus className="h-4 w-4" />
									</div>
									<span>Create Workspace</span>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Workspace</DialogTitle>
						<DialogDescription>
							Create a new workspace to organize your team and projects.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="workspace-name">Workspace Name</Label>
							<Input
								id="workspace-name"
								placeholder="Acme Inc"
								value={newWorkspaceName}
								onChange={(e) => handleNameChange(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workspace-slug">
								Workspace Slug
								<span className="ml-1 text-xs text-muted-foreground">
									(used in URLs)
								</span>
							</Label>
							<Input
								id="workspace-slug"
								placeholder="acme-inc"
								value={newWorkspaceSlug}
								onChange={(e) => setNewWorkspaceSlug(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowCreateDialog(false)}
							disabled={createWorkspace.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateWorkspace}
							disabled={createWorkspace.isPending}
						>
							{createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
