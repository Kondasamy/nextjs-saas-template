'use client'

import { Loader2, Plus, Shield } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { PermissionBrowser } from './permission-browser'

interface RoleEditorDialogProps {
	mode?: 'create' | 'edit'
	roleId?: string
	roleName?: string
	roleDescription?: string
	rolePermissions?: string[]
	onSuccess?: () => void
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function RoleEditorDialog({
	mode = 'create',
	roleId,
	roleName: initialName,
	roleDescription: initialDescription,
	rolePermissions: initialPermissions,
	onSuccess,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: RoleEditorDialogProps) {
	const { currentWorkspace } = useWorkspace()
	const [internalOpen, setInternalOpen] = useState(false)
	const [name, setName] = useState(initialName || '')
	const [description, setDescription] = useState(initialDescription || '')
	const [permissions, setPermissions] = useState<string[]>(
		initialPermissions || []
	)

	// Use controlled state if provided, otherwise use internal state
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen
	const setOpen =
		controlledOnOpenChange !== undefined
			? controlledOnOpenChange
			: setInternalOpen

	const createRole = trpc.permissions.createRole.useMutation({
		onSuccess: () => {
			toast.success('Role created successfully')
			setOpen(false)
			resetForm()
			onSuccess?.()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to create role')
		},
	})

	const updateRole = trpc.permissions.updateRole.useMutation({
		onSuccess: () => {
			toast.success('Role updated successfully')
			setOpen(false)
			resetForm()
			onSuccess?.()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update role')
		},
	})

	const resetForm = () => {
		setName(initialName || '')
		setDescription(initialDescription || '')
		setPermissions(initialPermissions || [])
	}

	const handleSave = () => {
		if (!currentWorkspace) {
			toast.error('No workspace selected')
			return
		}

		if (!name.trim()) {
			toast.error('Please provide a role name')
			return
		}

		if (permissions.length === 0) {
			toast.error('Please select at least one permission')
			return
		}

		if (mode === 'create') {
			createRole.mutate({
				organizationId: currentWorkspace.id,
				name: name.trim(),
				description: description.trim() || undefined,
				permissions,
			})
		} else if (mode === 'edit' && roleId) {
			updateRole.mutate({
				id: roleId,
				name: name.trim(),
				description: description.trim() || undefined,
				permissions,
			})
		}
	}

	const isLoading = createRole.isPending || updateRole.isPending

	if (!currentWorkspace) {
		return null
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{mode === 'create' ? (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create Role
					</Button>
				) : (
					<Button variant="outline" size="sm">
						<Shield className="mr-2 h-4 w-4" />
						Edit Permissions
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Create New Role' : 'Edit Role'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Create a custom role with specific permissions for your workspace.'
							: 'Update the role name, description, and permissions.'}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="role-name">Role Name</Label>
						<Input
							id="role-name"
							placeholder="e.g., Content Editor"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role-description">Description (Optional)</Label>
						<Textarea
							id="role-description"
							placeholder="Describe what this role can do..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
						/>
					</div>

					<div className="space-y-2">
						<Label>Permissions</Label>
						<PermissionBrowser
							selectedPermissions={permissions}
							onPermissionsChange={setPermissions}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => {
							setOpen(false)
							resetForm()
						}}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{mode === 'create' ? 'Create Role' : 'Save Changes'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
