'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
	const [open, setOpen] = useState(false)
	const router = useRouter()
	const { data: workspaces, isLoading } = trpc.workspace.list.useQuery()

	const currentWorkspace = workspaces?.[0] // This would come from context/state

	const handleSelect = (workspaceId: string) => {
		setOpen(false)
		router.push(`/workspaces/${workspaceId}`)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{currentWorkspace?.name ?? 'Select workspace...'}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search workspace..." />
					<CommandList>
						<CommandEmpty>No workspace found.</CommandEmpty>
						<CommandGroup>
							{workspaces?.map((workspace) => (
								<CommandItem
									key={workspace.id}
									value={workspace.id}
									onSelect={() => handleSelect(workspace.id)}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											currentWorkspace?.id === workspace.id
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									{workspace.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
				<div className="border-t p-2">
					<Button
						variant="ghost"
						className="w-full justify-start"
						onClick={() => router.push('/workspaces/new')}
					>
						<Plus className="mr-2 h-4 w-4" />
						Create workspace
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}

