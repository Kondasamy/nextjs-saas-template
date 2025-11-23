'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Key, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

const apiKeySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must not exceed 100 characters'),
	expiresInDays: z.string(),
})

type APIKeyFormData = z.infer<typeof apiKeySchema>

interface CreateAPIKeyDialogProps {
	onSuccess?: () => void
}

export function CreateAPIKeyDialog({ onSuccess }: CreateAPIKeyDialogProps) {
	const { currentWorkspace } = useWorkspace()
	const [open, setOpen] = useState(false)
	const [createdKey, setCreatedKey] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	const form = useForm<APIKeyFormData>({
		resolver: zodResolver(apiKeySchema),
		defaultValues: {
			name: '',
			expiresInDays: 'never',
		},
	})

	const createAPIKey = trpc.apiKeys.create.useMutation({
		onSuccess: (data) => {
			setCreatedKey(data.key)
			onSuccess?.()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to create API key')
		},
	})

	const handleCreate = (data: APIKeyFormData) => {
		if (!currentWorkspace) {
			toast.error('No workspace selected')
			return
		}

		const expiresInDaysNumber =
			data.expiresInDays === 'never'
				? undefined
				: Number.parseInt(data.expiresInDays)

		createAPIKey.mutate({
			organizationId: currentWorkspace.id,
			name: data.name.trim(),
			expiresInDays: expiresInDaysNumber,
		})
	}

	const handleCopyKey = () => {
		if (!createdKey) return

		navigator.clipboard.writeText(createdKey)
		setCopied(true)
		toast.success('API key copied to clipboard')
		setTimeout(() => setCopied(false), 2000)
	}

	const handleClose = () => {
		setOpen(false)
		form.reset()
		setCreatedKey(null)
		setCopied(false)
	}

	if (!currentWorkspace) {
		return null
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Create API Key
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{createdKey ? 'API Key Created' : 'Create New API Key'}
					</DialogTitle>
					<DialogDescription>
						{createdKey
							? 'Save this key securely. It will only be shown once.'
							: 'Create an API key for programmatic access to your workspace.'}
					</DialogDescription>
				</DialogHeader>

				{!createdKey ? (
					<form
						onSubmit={form.handleSubmit(handleCreate)}
						className="space-y-4 py-4"
					>
						<div className="space-y-2">
							<Label htmlFor="key-name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="key-name"
								placeholder="e.g., Production Server"
								{...form.register('name')}
							/>
							{form.formState.errors.name && (
								<p className="text-sm text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								A descriptive name to identify this API key
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="expires">Expiration</Label>
							<Select
								value={form.watch('expiresInDays')}
								onValueChange={(value) => form.setValue('expiresInDays', value)}
							>
								<SelectTrigger id="expires">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="never">Never</SelectItem>
									<SelectItem value="7">7 days</SelectItem>
									<SelectItem value="30">30 days</SelectItem>
									<SelectItem value="90">90 days</SelectItem>
									<SelectItem value="365">1 year</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								How long the key should remain valid
							</p>
						</div>

						<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
							<strong>Security Notice:</strong> API keys provide full access to
							your workspace. Keep them secure and never share them publicly.
						</div>
					</form>
				) : (
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Your API Key</Label>
							<div className="flex items-center gap-2">
								<div className="flex-1 rounded-md bg-muted p-3 font-mono text-sm break-all">
									{createdKey}
								</div>
								<Button variant="outline" size="sm" onClick={handleCopyKey}>
									{copied ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
							<strong>Important:</strong> Save this key now. It will never be
							shown again. If you lose it, you'll need to create a new one.
						</div>
					</div>
				)}

				<DialogFooter>
					{!createdKey ? (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								onClick={form.handleSubmit(handleCreate)}
								disabled={createAPIKey.isPending}
							>
								{createAPIKey.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create Key
							</Button>
						</>
					) : (
						<Button onClick={handleClose} className="w-full">
							<Key className="mr-2 h-4 w-4" />
							Done
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
