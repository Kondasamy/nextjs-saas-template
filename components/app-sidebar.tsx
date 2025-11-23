'use client'

import {
	Boxes,
	Check,
	ChevronsUpDown,
	Command as CommandIcon,
	LifeBuoy,
	Plus,
	Send,
	Settings2,
	Shield,
	SquareTerminal,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { FeedbackDialog } from '@/components/feedback-dialog'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { SupportDialog } from '@/components/support-dialog'
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
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

function WorkspaceSwitcherMenu() {
	const router = useRouter()
	const { currentWorkspace, workspaces, switchWorkspace, isLoading } =
		useWorkspace()
	const [open, setOpen] = useState(false)
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [newWorkspaceName, setNewWorkspaceName] = useState('')
	const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('')

	const utils = trpc.useUtils()

	const createWorkspace = trpc.workspace.create.useMutation({
		onSuccess: async (data) => {
			toast.success('Workspace created successfully')
			setShowCreateDialog(false)
			setNewWorkspaceName('')
			setNewWorkspaceSlug('')

			// Wait for workspace list to refetch first
			await utils.workspace.list.refetch()

			// Now switch to the newly created workspace (it's in the list now)
			switchWorkspace(data.id)

			// Invalidate all other queries and refresh
			void utils.invalidate()
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
		void utils.invalidate()
		router.refresh()
	}

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
			<SidebarMenuButton size="lg" disabled>
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<CommandIcon className="size-4" />
				</div>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-medium">Loading...</span>
					<span className="truncate text-xs text-primary/70">Please wait</span>
				</div>
			</SidebarMenuButton>
		)
	}

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<SidebarMenuButton size="lg">
						<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
							{currentWorkspace.logo ? (
								<img
									src={currentWorkspace.logo}
									alt={currentWorkspace.name}
									className="size-full object-cover"
								/>
							) : (
								<span className="text-sm font-semibold">
									{currentWorkspace.name[0]?.toUpperCase()}
								</span>
							)}
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">
								{currentWorkspace.name}
							</span>
							<span className="truncate text-xs text-primary/70">
								{currentWorkspace.role.name}
							</span>
						</div>
						<ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
					</SidebarMenuButton>
				</PopoverTrigger>
				<PopoverContent className="w-[280px] p-0" align="start">
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname()
	const [showSupportDialog, setShowSupportDialog] = useState(false)
	const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

	// Get full user data from database via tRPC
	// No need to check authUser first - tRPC handles authentication
	const { data: user } = trpc.user.getCurrent.useQuery()

	// Check if user is admin via tRPC
	const { data: isAdmin = false } = trpc.user.isAdmin.useQuery()

	const navSecondaryItems: Array<{
		title: string
		url?: string
		icon: typeof Settings2
		isActive?: boolean
		onClick?: () => void
		items?: Array<{ title: string; url: string }>
	}> = [
		{
			title: 'Settings',
			url: '/settings/profile',
			icon: Settings2,
			isActive:
				pathname.startsWith('/settings') || pathname.startsWith('/workspace'),
			items: [
				{
					title: 'Profile',
					url: '/settings/profile',
				},
				{
					title: 'Account',
					url: '/settings/account',
				},
				{
					title: 'Security',
					url: '/settings/security',
				},
				{
					title: 'Team',
					url: '/settings/team',
				},
				{
					title: 'Notifications',
					url: '/settings/notifications',
				},
				{
					title: 'Workspace Settings',
					url: '/workspace/settings',
				},
				{
					title: 'Roles & Permissions',
					url: '/workspace/roles',
				},
				{
					title: 'API Keys',
					url: '/workspace/api-keys',
				},
			],
		},
	]

	// Only add Admin section if user is admin
	if (isAdmin) {
		navSecondaryItems.push({
			title: 'Admin',
			url: '/admin',
			icon: Shield,
			isActive: pathname.startsWith('/admin'),
			items: [
				{
					title: 'Dashboard',
					url: '/admin',
				},
				{
					title: 'Users',
					url: '/admin/users',
				},
				{
					title: 'Audit Logs',
					url: '/admin/audit',
				},
				{
					title: 'Themes',
					url: '/admin/themes',
				},
				{
					title: 'Email Templates',
					url: '/admin/emails',
				},
			],
		})
	}

	navSecondaryItems.push(
		{
			title: 'Support',
			icon: LifeBuoy,
			onClick: () => setShowSupportDialog(true),
		},
		{
			title: 'Feedback',
			icon: Send,
			onClick: () => setShowFeedbackDialog(true),
		}
	)

	const data = {
		user: {
			name: user?.name || 'User',
			email: user?.email || 'user@example.com',
			avatar: user?.image || '',
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/',
				icon: SquareTerminal,
				isActive: pathname === '/',
			},
			{
				title: 'Features',
				url: '/features',
				icon: Boxes,
				isActive: pathname.startsWith('/features'),
			},
		],
		navSecondary: navSecondaryItems,
	}

	return (
		<>
			<Sidebar variant="inset" {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<WorkspaceSwitcherMenu />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<NavMain items={data.navMain} />
					<NavSecondary items={data.navSecondary} className="mt-auto" />
				</SidebarContent>
				<SidebarFooter>
					<NavUser user={data.user} />
				</SidebarFooter>
			</Sidebar>

			<SupportDialog
				open={showSupportDialog}
				onOpenChange={setShowSupportDialog}
			/>
			<FeedbackDialog
				open={showFeedbackDialog}
				onOpenChange={setShowFeedbackDialog}
			/>
		</>
	)
}
