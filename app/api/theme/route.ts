/**
 * Theme API Route
 * Serves the active theme CSS with proper caching headers
 */

import { NextResponse } from 'next/server'
import { getActiveTheme, getThemeCSS } from '@/lib/theme/server'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const activeTheme = await getActiveTheme()
		const css = await getThemeCSS(activeTheme)

		return new NextResponse(css, {
			headers: {
				'Content-Type': 'text/css',
				'Cache-Control': 'public, max-age=60, s-maxage=60',
			},
		})
	} catch (error) {
		console.error('Error serving theme CSS:', error)
		return new NextResponse('/* Error loading theme */', {
			status: 500,
			headers: {
				'Content-Type': 'text/css',
			},
		})
	}
}
