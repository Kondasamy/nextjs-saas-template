'use client'

import { Check, Palette } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import type { ThemeDefinition } from '@/lib/theme/config'
import { trpc } from '@/lib/trpc/client'

type ThemeManagerProps = {
	themes: ThemeDefinition[]
	activeThemeId: string
}

export function ThemeManager({ themes, activeThemeId }: ThemeManagerProps) {
	const [selectedTheme, setSelectedTheme] = useState(activeThemeId)
	const utils = trpc.useUtils()

	const setThemeMutation = trpc.theme.setActiveTheme.useMutation({
		onSuccess: (data) => {
			toast.success('Theme updated successfully', {
				description: 'The new theme will be applied across the application.',
			})
			setSelectedTheme(data.themeId)
			utils.theme.getActiveTheme.invalidate()

			// Reload the page to apply the new theme
			setTimeout(() => {
				window.location.reload()
			}, 500)
		},
		onError: (error) => {
			toast.error('Failed to update theme', {
				description: error.message,
			})
		},
	})

	const handleThemeChange = (themeId: string) => {
		if (themeId === selectedTheme) return

		setThemeMutation.mutate({ themeId })
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Select Theme</CardTitle>
					<CardDescription>
						Choose a theme to customize the appearance of your application.
						Changes will be applied immediately for all users.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 grid-cols-2 md:grid-cols-4">
						{themes.map((theme) => {
							const isActive = theme.id === selectedTheme
							const isLoading =
								setThemeMutation.isPending &&
								setThemeMutation.variables?.themeId === theme.id

							return (
								<div
									key={theme.id}
									className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
										isActive
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/50'
									}`}
									onClick={() => handleThemeChange(theme.id)}
								>
									<div className="space-y-3">
										{/* Theme name and status */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Palette className="size-4 text-muted-foreground" />
												<span className="text-sm font-semibold">
													{theme.name}
												</span>
											</div>
											{isActive && <Check className="size-4 text-primary" />}
										</div>

										{/* Color palette */}
										<div className="flex gap-1.5">
											<div
												className="h-8 flex-1 rounded border shadow-sm"
												style={{ backgroundColor: theme.previewColors.primary }}
												title="Primary"
											/>
											<div
												className="h-8 flex-1 rounded border shadow-sm"
												style={{
													backgroundColor: theme.previewColors.secondary,
												}}
												title="Secondary"
											/>
											<div
												className="h-8 flex-1 rounded border shadow-sm"
												style={{ backgroundColor: theme.previewColors.accent }}
												title="Accent"
											/>
										</div>

										{/* Description */}
										<p className="text-xs text-muted-foreground line-clamp-2">
											{theme.description}
										</p>

										{/* Apply button (only for non-active themes) */}
										{!isActive && (
											<Button
												size="sm"
												className="w-full"
												variant={isActive ? 'default' : 'outline'}
												disabled={isLoading}
												onClick={(e) => {
													e.stopPropagation()
													handleThemeChange(theme.id)
												}}
											>
												{isLoading ? 'Applying...' : 'Apply'}
											</Button>
										)}

										{/* Active badge */}
										{isActive && (
											<div className="flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
												Active Theme
											</div>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Custom Themes</CardTitle>
					<CardDescription>
						Want to create a custom theme? Visit{' '}
						<a
							href="https://tweakcn.com/editor/theme"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline underline-offset-4 hover:no-underline"
						>
							TweakCN Theme Editor
						</a>{' '}
						to customize colors and export the CSS. Then add the theme file to
						the <code className="rounded bg-muted px-1 py-0.5">themes/</code>{' '}
						directory.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md bg-muted p-4">
						<p className="mb-2 text-sm font-medium">To add a new theme:</p>
						<ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
							<li>
								Create a CSS file in <code>themes/your-theme-name.css</code>
							</li>
							<li>
								Add theme definition to <code>lib/theme/config.ts</code>
							</li>
							<li>Restart the application to see your new theme</li>
						</ol>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
