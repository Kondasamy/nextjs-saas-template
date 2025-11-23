/**
 * Server-side theme utilities
 * These functions run on the server and interact with the database
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { DEFAULT_THEME, isValidTheme } from './config'

/**
 * Get the active theme from the database
 * Returns the default theme if none is set
 */
export async function getActiveTheme(): Promise<string> {
	try {
		const settings = await prisma.systemSettings.findUnique({
			where: { id: 'system' },
		})

		if (settings?.theme && isValidTheme(settings.theme)) {
			return settings.theme
		}

		return DEFAULT_THEME
	} catch (error) {
		logger.error('Error fetching active theme', error)
		return DEFAULT_THEME
	}
}

/**
 * Update the active theme in the database
 * Creates the settings record if it doesn't exist
 */
export async function setActiveTheme(
	themeId: string,
	updatedBy?: string
): Promise<void> {
	if (!isValidTheme(themeId)) {
		throw new Error(`Invalid theme ID: ${themeId}`)
	}

	await prisma.systemSettings.upsert({
		where: { id: 'system' },
		update: {
			theme: themeId,
			updatedBy,
		},
		create: {
			id: 'system',
			theme: themeId,
			updatedBy,
		},
	})
}

/**
 * Get the CSS content for a specific theme
 * Reads the theme file from the themes directory
 */
export async function getThemeCSS(themeId: string): Promise<string> {
	if (!isValidTheme(themeId)) {
		themeId = DEFAULT_THEME
	}

	try {
		const themePath = join(process.cwd(), 'themes', `${themeId}.css`)
		const css = await readFile(themePath, 'utf-8')
		return css
	} catch (error) {
		logger.error('Error reading theme file', { themeId, error })
		// Fallback to default theme
		try {
			const defaultPath = join(process.cwd(), 'themes', `${DEFAULT_THEME}.css`)
			return await readFile(defaultPath, 'utf-8')
		} catch (fallbackError) {
			logger.error('Error reading default theme', fallbackError)
			return ''
		}
	}
}

/**
 * Extract just the CSS variables (without comments or boilerplate)
 * Useful for previews or inline styles
 */
export function extractThemeVariables(css: string): string {
	// Remove comments
	const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

	// Extract :root and .dark blocks
	const rootMatch = withoutComments.match(/:root\s*\{([^}]+)\}/s)
	const darkMatch = withoutComments.match(/\.dark\s*\{([^}]+)\}/s)

	let result = ''
	if (rootMatch) result += `:root {${rootMatch[1]}}\n\n`
	if (darkMatch) result += `.dark {${darkMatch[1]}}`

	return result.trim()
}
