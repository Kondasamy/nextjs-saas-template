'use client'

import { formatDistanceToNow } from 'date-fns'
import { Download, Filter, Search } from 'lucide-react'
import { useState } from 'react'
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
	const limit = 50

	const { data } = trpc.admin.getAuditLogs.useQuery({
		limit,
		offset: page * limit,
		action: actionFilter === 'all' ? undefined : actionFilter,
	})

	const handleExport = () => {
		if (!data) return

		const csv = [
			['Timestamp', 'User', 'Action', 'Organization', 'IP Address'].join(','),
			...data.logs.map((log) =>
				[
					new Date(log.createdAt).toISOString(),
					log.user.email,
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
				<Select value={actionFilter} onValueChange={setActionFilter}>
					<SelectTrigger className="w-[200px]">
						<Filter className="mr-2 h-4 w-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Actions</SelectItem>
						<SelectItem value="user.login">User Login</SelectItem>
						<SelectItem value="user.signup">User Signup</SelectItem>
						<SelectItem value="workspace.create">Workspace Created</SelectItem>
						<SelectItem value="workspace.delete">Workspace Deleted</SelectItem>
						<SelectItem value="member.invite">Member Invited</SelectItem>
						<SelectItem value="member.remove">Member Removed</SelectItem>
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
								<TableRow key={log.id}>
									<TableCell>
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
									</TableCell>
									<TableCell>
										<Badge variant={ACTION_COLORS[log.action] as any || 'default'}>
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
		</div>
	)
}
