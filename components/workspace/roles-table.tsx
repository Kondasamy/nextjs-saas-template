'use client'

import { formatDistanceToNow } from 'date-fns'
import { Loader2, MoreVertical, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RoleEditorDialog } from '@/components/settings/role-editor-dialog'
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
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

export function RolesTable() {
	const { currentWorkspace } = useWorkspace()
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
	const [editingRole, setEditingRole] = useState<{
		id: string
		name: string
		description?: string
		permissions: string[]
	} | null>(null)

	const {
		data: roles,
		isLoading,
		refetch,
	} = trpc.permissions.listRoles.useQuery(
		{
			organizationId: currentWorkspace?.id ?? '',
		},
		{
			enabled: !!currentWorkspace,
		}
	)

	const deleteRole = trpc.permissions.deleteRole.useMutation({
		onSuccess: () => {
			toast.success('Role deleted successfully')
			refetch()
			setDeletingRoleId(null)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to delete role')
			setDeletingRoleId(null)
		},
	})

	const handleDeleteRole = (roleId: string, roleName: string) => {
		if (
			!confirm(
				`Are you sure you want to delete the role "${roleName}"? Members with this role will lose their permissions.`
			)
		) {
			return
		}

		setDeletingRoleId(roleId)
		deleteRole.mutate({ id: roleId })
	}

	if (!currentWorkspace) {
		return null
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8 text-muted-foreground">
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Loading roles...
			</div>
		)
	}

	if (!roles || roles.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<Shield className="mb-2 h-8 w-8 text-muted-foreground" />
				<p className="text-muted-foreground mb-4">No roles found</p>
				<RoleEditorDialog mode="create" onSuccess={refetch} />
			</div>
		)
	}

	const handleEditSuccess = () => {
		refetch()
		setEditingRole(null)
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex justify-end">
					<RoleEditorDialog mode="create" onSuccess={refetch} />
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Role Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Permissions</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Type</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{roles.map((role) => {
								const hasAllPermissions = role.permissions.includes('*')
								const permissionCount = hasAllPermissions
									? 'All'
									: role.permissions.length

								return (
									<TableRow key={role.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Shield className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium">{role.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{role.description || '—'}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant={hasAllPermissions ? 'default' : 'secondary'}
											>
												{permissionCount}{' '}
												{hasAllPermissions
													? 'permissions'
													: `permission${permissionCount !== 1 ? 's' : ''}`}
											</Badge>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{formatDistanceToNow(new Date(role.createdAt), {
													addSuffix: true,
												})}
											</span>
										</TableCell>
										<TableCell>
											{role.isSystem ? (
												<Badge variant="outline">System</Badge>
											) : (
												<Badge variant="secondary">Custom</Badge>
											)}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{!role.isSystem && (
														<DropdownMenuItem
															onClick={() =>
																setEditingRole({
																	id: role.id,
																	name: role.name,
																	description: role.description || undefined,
																	permissions: role.permissions,
																})
															}
														>
															<Shield className="mr-2 h-4 w-4" />
															Edit Permissions
														</DropdownMenuItem>
													)}
													{!role.isSystem && (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() =>
																handleDeleteRole(role.id, role.name)
															}
															disabled={deletingRoleId === role.id}
														>
															{deletingRoleId === role.id ? (
																<>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	Deleting...
																</>
															) : (
																<>
																	<Trash2 className="mr-2 h-4 w-4" />
																	Delete Role
																</>
															)}
														</DropdownMenuItem>
													)}
													{role.isSystem && (
														<div className="px-2 py-1.5 text-xs text-muted-foreground">
															System roles cannot be modified
														</div>
													)}
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

			{/* Edit Role Dialog - controlled externally */}
			{editingRole && (
				<RoleEditorDialog
					mode="edit"
					roleId={editingRole.id}
					roleName={editingRole.name}
					roleDescription={editingRole.description}
					rolePermissions={editingRole.permissions}
					onSuccess={handleEditSuccess}
					open={true}
					onOpenChange={(open) => {
						if (!open) {
							setEditingRole(null)
						}
					}}
				/>
			)}
		</>
	)
}
