'use client'

import { formatDistanceToNow } from 'date-fns'
import { Download, Filter, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ActivityDetailModal } from '@/components/admin/activity-detail-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const ACTION_COLORS: Record<string, string> = {
	'user.login': 'default',
	'user.logout': 'secondary',
	'user.signup': 'default',
	'workspace.create': 'default',
	'workspace.delete': 'destructive',
	'member.invite': 'default',
	'member.remove': 'destructive',
}

export function AuditLogTable() {
	const [page, setPage] = useState(0)
	const [actionFilter, setActionFilter] = useState<string>('all')
	const [searchInput, setSearchInput] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [selectedActivity, setSelectedActivity] = useState<any>(null)
	const [modalOpen, setModalOpen] = useState(false)
	const limit = 50

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput)
			setPage(0) // Reset to first page on search
		}, 500)

		return () => clearTimeout(timer)
	}, [searchInput])

	// Fetch available actions for the filter
	const { data: availableActions } = trpc.admin.getAuditLogActions.useQuery(
		undefined,
		{
			staleTime: 5 * 60 * 1000, // Cache for 5 minutes
			gcTime: 10 * 60 * 1000,
		}
	)

	const { data } = trpc.admin.getAuditLogs.useQuery(
		{
			limit,
			offset: page * limit,
			action: actionFilter === 'all' ? undefined : actionFilter,
			search: debouncedSearch || undefined,
		},
		{
			// Keep previous data while fetching new page
			placeholderData: (previousData) => previousData,
			// Cache audit logs for 2 minutes (they update more frequently)
			staleTime: 2 * 60 * 1000,
			// Keep cached data for 5 minutes
			gcTime: 5 * 60 * 1000,
			// Don't refetch on window focus
			refetchOnWindowFocus: false,
			// Refetch every 30 seconds if window is focused
			refetchInterval: 30 * 1000,
			refetchIntervalInBackground: false,
		}
	)

	const handleExport = () => {
		if (!data) return

		const csv = [
			['Timestamp', 'User', 'Action', 'Organization', 'IP Address'].join(','),
			...data.logs.map((log) =>
				[
					new Date(log.createdAt).toISOString(),
					log.user?.email || 'N/A',
					log.action,
					log.organization?.name || 'N/A',
					log.ipAddress || 'N/A',
				].join(',')
			),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `audit-logs-${new Date().toISOString()}.csv`
		a.click()
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by user, action, organization, IP..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={actionFilter} onValueChange={setActionFilter}>
					<SelectTrigger className="w-[240px]">
						<Filter className="mr-2 h-4 w-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="max-h-[400px]">
						<SelectItem value="all">All Actions</SelectItem>
						{availableActions?.map((action) => (
							<SelectItem key={action} value={action}>
								{action}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button variant="outline" onClick={handleExport}>
					<Download className="mr-2 h-4 w-4" />
					Export CSV
				</Button>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Action</TableHead>
							<TableHead>Organization</TableHead>
							<TableHead>IP Address</TableHead>
							<TableHead>Time</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{!data || data.logs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No audit logs found
								</TableCell>
							</TableRow>
						) : (
							data.logs.map((log) => (
								<TableRow
									key={log.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => {
										setSelectedActivity(log)
										setModalOpen(true)
									}}
								>
									<TableCell>
										{log.user ? (
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={log.user.image || undefined} />
													<AvatarFallback>
														{log.user.name?.[0]?.toUpperCase() ||
															log.user.email[0]?.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-medium">
														{log.user.name || log.user.email}
													</span>
													<span className="text-xs text-muted-foreground">
														{log.user.email}
													</span>
												</div>
											</div>
										) : (
											<span className="text-muted-foreground">
												Unknown User
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={(ACTION_COLORS[log.action] as any) || 'default'}
										>
											{log.action}
										</Badge>
									</TableCell>
									<TableCell className="text-sm">
										{log.organization?.name || '-'}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{log.ipAddress || '-'}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{formatDistanceToNow(new Date(log.createdAt), {
											addSuffix: true,
										})}
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
						{Math.min((page + 1) * limit, data.total)} of {data.total} logs
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

			<ActivityDetailModal
				activity={selectedActivity}
				open={modalOpen}
				onOpenChange={setModalOpen}
			/>
		</div>
	)
}
