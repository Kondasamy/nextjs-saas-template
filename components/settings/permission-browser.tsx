'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	getPermissionsByCategory,
	PERMISSIONS,
	type PermissionDefinition,
} from '@/lib/permissions/constants'

interface PermissionBrowserProps {
	selectedPermissions: string[]
	onPermissionsChange: (permissions: string[]) => void
	showSelectAll?: boolean
	readOnly?: boolean
}

export function PermissionBrowser({
	selectedPermissions,
	onPermissionsChange,
	showSelectAll = true,
	readOnly = false,
}: PermissionBrowserProps) {
	const permissionsByCategory = getPermissionsByCategory()
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(Object.keys(permissionsByCategory))
	)

	const hasAllPermission = selectedPermissions.includes(PERMISSIONS.ALL)

	const toggleCategory = (category: string) => {
		const newExpanded = new Set(expandedCategories)
		if (newExpanded.has(category)) {
			newExpanded.delete(category)
		} else {
			newExpanded.add(category)
		}
		setExpandedCategories(newExpanded)
	}

	const togglePermission = (permissionKey: string) => {
		if (readOnly) return

		// If toggling the ALL permission
		if (permissionKey === PERMISSIONS.ALL) {
			if (hasAllPermission) {
				onPermissionsChange([])
			} else {
				onPermissionsChange([PERMISSIONS.ALL])
			}
			return
		}

		// If already has ALL permission, don't allow toggling individual permissions
		if (hasAllPermission) {
			return
		}

		const newPermissions = selectedPermissions.includes(permissionKey)
			? selectedPermissions.filter((p) => p !== permissionKey)
			: [...selectedPermissions, permissionKey]

		onPermissionsChange(newPermissions)
	}

	const isPermissionSelected = (permissionKey: string) => {
		return hasAllPermission || selectedPermissions.includes(permissionKey)
	}

	return (
		<div className="space-y-4">
			{showSelectAll && (
				<Card className="border-primary/50 bg-primary/5">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">Administrator Access</CardTitle>
							{hasAllPermission && <Badge variant="default">Active</Badge>}
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-start space-x-3">
							<Checkbox
								id="permission-all"
								checked={hasAllPermission}
								onCheckedChange={() => togglePermission(PERMISSIONS.ALL)}
								disabled={readOnly}
							/>
							<div className="space-y-1 leading-none">
								<Label
									htmlFor="permission-all"
									className="font-medium cursor-pointer"
								>
									All Permissions (Owner)
								</Label>
								<p className="text-sm text-muted-foreground">
									Grant full access to all workspace features and settings. This
									overrides all individual permissions.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{hasAllPermission && (
				<div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-sm">
					<p className="font-medium text-primary mb-1">
						Owner permissions enabled
					</p>
					<p className="text-muted-foreground">
						Individual permissions are disabled because "All Permissions" is
						selected. Deselect it to configure granular permissions.
					</p>
				</div>
			)}

			<ScrollArea className="h-[500px] pr-4">
				<div className="space-y-4">
					{Object.entries(permissionsByCategory).map(
						([category, permissions]) => {
							// Skip Admin category as it's shown separately
							if (category === 'Admin') return null

							const isExpanded = expandedCategories.has(category)
							const categoryPermissions = permissions.map((p) => p.key)
							const selectedCount = categoryPermissions.filter((p) =>
								isPermissionSelected(p)
							).length

							return (
								<Card key={category}>
									<CardHeader
										className="cursor-pointer pb-3"
										onClick={() => toggleCategory(category)}
									>
										<div className="flex items-center justify-between">
											<CardTitle className="text-base flex items-center gap-2">
												{category}
												{selectedCount > 0 && (
													<Badge variant="secondary" className="ml-2">
														{selectedCount} / {categoryPermissions.length}
													</Badge>
												)}
											</CardTitle>
											<div>
												{isExpanded ? (
													<CheckCircle2 className="h-4 w-4 text-primary" />
												) : (
													<Circle className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
										</div>
									</CardHeader>

									{isExpanded && (
										<CardContent className="space-y-3">
											{permissions.map((permission: PermissionDefinition) => (
												<div
													key={permission.key}
													className="flex items-start space-x-3"
												>
													<Checkbox
														id={`permission-${permission.key}`}
														checked={isPermissionSelected(permission.key)}
														onCheckedChange={() =>
															togglePermission(permission.key)
														}
														disabled={readOnly || hasAllPermission}
													/>
													<div className="space-y-1 leading-none flex-1">
														<Label
															htmlFor={`permission-${permission.key}`}
															className="font-medium cursor-pointer"
														>
															{permission.name}
														</Label>
														<p className="text-sm text-muted-foreground">
															{permission.description}
														</p>
													</div>
												</div>
											))}
										</CardContent>
									)}
								</Card>
							)
						}
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
