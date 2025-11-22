'use client'

import { formatDistanceToNow } from 'date-fns'
import { Check, Copy, Key, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { CreateAPIKeyDialog } from '@/components/workspace/create-api-key-dialog'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function APIKeysTable() {
	const { currentWorkspace } = useWorkspace()
	const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
	const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

	const {
		data: apiKeys,
		isLoading,
		refetch,
	} = trpc.apiKeys.list.useQuery(
		{
			organizationId: currentWorkspace?.id ?? '',
		},
		{
			enabled: !!currentWorkspace,
		}
	)

	const revokeKey = trpc.apiKeys.revoke.useMutation({
		onSuccess: () => {
			toast.success('API key revoked successfully')
			refetch()
			setDeletingKeyId(null)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to revoke API key')
			setDeletingKeyId(null)
		},
	})

	const handleRevokeKey = (keyId: string, keyName: string) => {
		if (
			!confirm(
				`Are you sure you want to revoke "${keyName}"? This action cannot be undone and will break any integrations using this key.`
			)
		) {
			return
		}

		setDeletingKeyId(keyId)
		revokeKey.mutate({ id: keyId })
	}

	const handleCopyKey = (keyLastChars: string, keyId: string) => {
		// Note: We only have the last 8 characters stored
		toast.warning(
			'Only last 8 characters available. Full keys are shown only on creation.'
		)
		navigator.clipboard.writeText(`...${keyLastChars}`)
		setCopiedKeyId(keyId)
		setTimeout(() => setCopiedKeyId(null), 2000)
	}

	if (!currentWorkspace) {
		return null
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Loading API keys...
			</div>
		)
	}

	if (!apiKeys || apiKeys.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<Key className="mb-2 h-8 w-8 text-muted-foreground" />
				<p className="text-muted-foreground mb-4">No API keys created yet</p>
				<CreateAPIKeyDialog onSuccess={refetch} />
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<CreateAPIKeyDialog onSuccess={refetch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Key (Last 8)</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead>Last Used</TableHead>
							<TableHead>Expires</TableHead>
							<TableHead className="w-[70px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{apiKeys.map((apiKey) => {
							const isExpired =
								apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()

							return (
								<TableRow key={apiKey.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Key className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">{apiKey.name}</span>
											{isExpired && (
												<Badge variant="destructive" className="ml-2">
													Expired
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<code className="text-xs bg-muted px-2 py-1 rounded">
												...{apiKey.key}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
											>
												{copiedKeyId === apiKey.id ? (
													<Check className="h-3 w-3 text-green-500" />
												) : (
													<Copy className="h-3 w-3" />
												)}
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											<div className="font-medium">
												{apiKey.createdBy.name || 'Unknown'}
											</div>
											<div className="text-muted-foreground">
												{apiKey.createdBy.email}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm text-muted-foreground">
											{apiKey.lastUsedAt
												? formatDistanceToNow(new Date(apiKey.lastUsedAt), {
														addSuffix: true,
													})
												: 'Never'}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm text-muted-foreground">
											{apiKey.expiresAt
												? formatDistanceToNow(new Date(apiKey.expiresAt), {
														addSuffix: true,
													})
												: 'Never'}
										</span>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													className="text-destructive"
													onClick={() =>
														handleRevokeKey(apiKey.id, apiKey.name)
													}
													disabled={deletingKeyId === apiKey.id}
												>
													{deletingKeyId === apiKey.id ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Revoking...
														</>
													) : (
														<>
															<Trash2 className="mr-2 h-4 w-4" />
															Revoke Key
														</>
													)}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
