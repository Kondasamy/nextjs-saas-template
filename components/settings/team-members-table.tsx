'use client'

import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'

interface TeamMembersTableProps {
	organizationId: string
}

export function TeamMembersTable({ organizationId }: TeamMembersTableProps) {
	const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)

	const { data: organization, refetch } = trpc.workspace.getById.useQuery({
		id: organizationId,
	})

	const updateMemberRole = trpc.workspace.updateMemberRole?.useMutation({
		onSuccess: () => {
			toast.success('Member role updated successfully')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update member role')
		},
		onSettled: () => {
			setUpdatingMemberId(null)
		},
	})

	const removeMember = trpc.workspace.removeMember?.useMutation({
		onSuccess: () => {
			toast.success('Member removed successfully')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to remove member')
		},
	})

	const handleRoleChange = (memberId: string, newRoleId: string) => {
		setUpdatingMemberId(memberId)
		updateMemberRole.mutate({
			organizationId,
			userId: memberId,
			roleId: newRoleId,
		})
	}

	const handleRemoveMember = (memberId: string) => {
		if (
			confirm('Are you sure you want to remove this member from the workspace?')
		) {
			removeMember.mutate({
				organizationId,
				userId: memberId,
			})
		}
	}

	if (!organization) {
		return <div>Loading...</div>
	}

	const members = organization.members || []

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Member</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{members.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={4}
								className="text-center text-muted-foreground"
							>
								No team members yet
							</TableCell>
						</TableRow>
					) : (
						members.map((member) => (
							<TableRow key={member.id}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage src={member.user.image || undefined} />
											<AvatarFallback>
												{member.user.name?.[0]?.toUpperCase() ||
													member.user.email[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="font-medium">
												{member.user.name || member.user.email}
											</span>
											<span className="text-sm text-muted-foreground">
												{member.user.email}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Select
										value={member.roleId}
										onValueChange={(value) =>
											handleRoleChange(member.userId, value)
										}
										disabled={updatingMemberId === member.userId}
									>
										<SelectTrigger className="w-[120px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="owner">Owner</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="viewer">Viewer</SelectItem>
										</SelectContent>
									</Select>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											{formatDistanceToNow(new Date(member.joinedAt), {
												addSuffix: true,
											})}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => handleRemoveMember(member.userId)}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Remove Member
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}
