/**
 * ThemeStyles Component
 * Inlines the active theme CSS to prevent flash of unstyled content
 * This runs on the server and injects CSS directly into the HTML
 */

import { getActiveTheme, getThemeCSS } from '@/lib/theme/server'

export async function ThemeStyles() {
	try {
		const activeTheme = await getActiveTheme()
		const css = await getThemeCSS(activeTheme)

		// Extract just the CSS variables (remove comments for smaller HTML)
		const minifiedCSS = css.replace(/\/\*[\s\S]*?\*\//g, '').trim()

		return (
			<style
				id="theme-styles"
				dangerouslySetInnerHTML={{ __html: minifiedCSS }}
			/>
		)
	} catch (error) {
		console.error('Error loading theme styles:', error)
		// Return empty style tag if there's an error
		return <style id="theme-styles" />
	}
}
