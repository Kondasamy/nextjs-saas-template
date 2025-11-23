'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/hooks/use-notifications'
import { trpc } from '@/lib/trpc/client'

export function NotificationsDropdown() {
	const { notifications, isLoading, unreadCount } = useNotifications()
	const utils = trpc.useUtils()

	const markAsRead = trpc.notifications.markAsRead.useMutation({
		onSuccess: () => {
			utils.notifications.list.invalidate()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to mark notification as read')
		},
	})

	const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
		onSuccess: () => {
			toast.success('All notifications marked as read')
			utils.notifications.list.invalidate()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to mark all as read')
		},
	})

	const deleteNotification = trpc.notifications.delete.useMutation({
		onSuccess: () => {
			utils.notifications.list.invalidate()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to delete notification')
		},
	})

	const handleMarkAsRead = (id: string) => {
		markAsRead.mutate({ id })
	}

	const handleMarkAllAsRead = () => {
		markAllAsRead.mutate()
	}

	const handleDelete = (id: string) => {
		deleteNotification.mutate({ id })
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
						>
							{unreadCount > 9 ? '9+' : unreadCount}
						</Badge>
					)}
					<span className="sr-only">Notifications</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[380px]">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto py-0 px-2 text-xs"
							onClick={handleMarkAllAsRead}
							disabled={markAllAsRead.isPending}
						>
							Mark all as read
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : notifications.length === 0 ? (
					<div className="py-8 text-center text-sm text-muted-foreground">
						No notifications yet
					</div>
				) : (
					<ScrollArea className="h-[400px]">
						<div className="space-y-1">
							{notifications.map((notification) => (
								<DropdownMenuItem
									key={notification.id}
									className="flex items-start gap-3 p-3 cursor-default focus:bg-accent"
									onSelect={(e) => e.preventDefault()}
								>
									<div className="flex-1 space-y-1">
										<div className="flex items-start justify-between gap-2">
											<p
												className={`text-sm font-medium ${
													notification.read ? 'text-muted-foreground' : ''
												}`}
											>
												{notification.title}
											</p>
											{!notification.read && (
												<div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
											)}
										</div>
										<p className="text-xs text-muted-foreground">
											{notification.message}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
											})}
										</p>
										<div className="flex items-center gap-2 mt-2">
											{!notification.read && (
												<Button
													variant="ghost"
													size="sm"
													className="h-6 px-2 text-xs"
													onClick={() => handleMarkAsRead(notification.id)}
													disabled={markAsRead.isPending}
												>
													<Check className="h-3 w-3 mr-1" />
													Mark as read
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												className="h-6 px-2 text-xs text-destructive hover:text-destructive"
												onClick={() => handleDelete(notification.id)}
												disabled={deleteNotification.isPending}
											>
												<Trash2 className="h-3 w-3 mr-1" />
												Delete
											</Button>
										</div>
									</div>
								</DropdownMenuItem>
							))}
						</div>
					</ScrollArea>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
