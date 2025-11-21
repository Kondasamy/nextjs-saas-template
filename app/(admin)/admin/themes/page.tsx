import { Suspense } from 'react'
import { ThemeManager } from '@/components/admin/theme-manager'
import { createServerCaller } from '@/lib/trpc/server'

export const metadata = {
	title: 'Theme Management',
	description: 'Manage application themes and appearance',
}

export default async function ThemesPage() {
	const caller = await createServerCaller()

	const [themes, activeTheme] = await Promise.all([
		caller.theme.getAvailableThemes(),
		caller.theme.getActiveTheme(),
	])

	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Theme Management</h1>
				<p className="text-muted-foreground">
					Customize the look and feel of your application
				</p>
			</div>

			<Suspense fallback={<div>Loading themes...</div>}>
				<ThemeManager themes={themes} activeThemeId={activeTheme.id} />
			</Suspense>
		</div>
	)
}
