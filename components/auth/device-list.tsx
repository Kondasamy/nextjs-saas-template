'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function DeviceList() {
	// This would use a tRPC query to fetch sessions
	// For now, this is a placeholder component structure

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Active Sessions</h3>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Device</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Last Active</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Current Device</TableCell>
						<TableCell>Unknown</TableCell>
						<TableCell>Just now</TableCell>
						<TableCell>
							<Button variant="ghost" size="icon">
								<Trash2 className="h-4 w-4" />
							</Button>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	)
}

