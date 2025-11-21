'use client'

import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Search, Trash2, UserCog, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { trpc } from '@/lib/trpc/client'

export function UsersTable() {
	const router = useRouter()
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(0)
	const [impersonating, setImpersonating] = useState(false)
	const limit = 50

	const { data, refetch } = trpc.admin.getAllUsers.useQuery({
		limit,
		offset: page * limit,
		search: search || undefined,
	})

	const deleteUser = trpc.admin.deleteUser.useMutation({
		onSuccess: () => {
			toast.success('User deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to delete user')
		},
	})

	const updateStatus = trpc.admin.updateUserStatus.useMutation({
		onSuccess: () => {
			toast.success('User status updated')
			refetch()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update user status')
		},
	})

	const handleDelete = (userId: string, email: string) => {
		if (confirm(`Are you sure you want to delete user ${email}?`)) {
			deleteUser.mutate({ userId })
		}
	}

	const handleBan = (userId: string, currentlyBanned: boolean) => {
		updateStatus.mutate({
			userId,
			banned: !currentlyBanned,
		})
	}

	const handleImpersonate = async (userId: string, email: string) => {
		if (
			!confirm(
				`Are you sure you want to impersonate ${email}? This action will be logged.`
			)
		) {
			return
		}

		setImpersonating(true)
		try {
			const response = await fetch('/api/admin/impersonation/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			})

			if (!response.ok) {
				throw new Error('Failed to start impersonation')
			}

			toast.success(`Now impersonating ${email}`)
			router.push('/')
			router.refresh()
		} catch (error) {
			console.error('Error starting impersonation:', error)
			toast.error('Failed to start impersonation')
		} finally {
			setImpersonating(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search users by email or name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-8"
					/>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Organizations</TableHead>
							<TableHead>Created</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{!data || data.users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No users found
								</TableCell>
							</TableRow>
						) : (
							data.users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={user.image || undefined} />
												<AvatarFallback>
													{user.name?.[0]?.toUpperCase() ||
														user.email[0]?.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium">
													{user.name || user.email}
												</span>
												<span className="text-sm text-muted-foreground">
													{user.email}
												</span>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="secondary">
											{user._count.organizations} workspaces
										</Badge>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{formatDistanceToNow(new Date(user.createdAt), {
											addSuffix: true,
										})}
									</TableCell>
									<TableCell>
										{user.banned ? (
											<Badge variant="destructive">Banned</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
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
													onClick={() => handleImpersonate(user.id, user.email)}
													disabled={impersonating}
												>
													<UserCog className="mr-2 h-4 w-4" />
													Impersonate User
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleBan(user.id, user.banned ?? false)
													}
												>
													<UserX className="mr-2 h-4 w-4" />
													{user.banned ? 'Unban User' : 'Ban User'}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDelete(user.id, user.email)}
													className="text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete User
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

			{data && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {page * limit + 1} to{' '}
						{Math.min((page + 1) * limit, data.total)} of {data.total} users
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(page - 1)}
							disabled={page === 0}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(page + 1)}
							disabled={!data.hasMore}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
