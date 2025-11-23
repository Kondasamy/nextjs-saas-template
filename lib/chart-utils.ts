/**
 * Utilities for chart components to optimize performance
 */

// Cache CSS variable reads to prevent layout thrashing
let cachedColors: Record<string, string> | null = null
let themeObserver: MutationObserver | null = null

/**
 * Get chart colors from CSS variables with caching
 * Prevents layout thrashing by caching computed styles
 */
export function getChartColors() {
	// Return cached colors if available
	if (cachedColors) return cachedColors

	// Only read CSS variables on client side
	if (typeof window === 'undefined') {
		return {
			chart1: 'hsl(221.2 83.2% 53.3%)',
			chart2: 'hsl(217.2 91.2% 59.8%)',
			chart3: 'hsl(215.4 78.2% 51.4%)',
			chart4: 'hsl(213.1 94.2% 55.8%)',
			chart5: 'hsl(211.2 88.2% 52.3%)',
			muted: 'hsl(215.4 16.3% 46.9%)',
			card: 'hsl(0 0% 100%)',
			border: 'hsl(214.3 31.8% 91.4%)',
			foreground: 'hsl(222.2 84% 4.9%)',
			background: 'hsl(0 0% 100%)',
		}
	}

	// Read CSS variables once
	const root = document.documentElement
	const style = getComputedStyle(root)

	cachedColors = {
		chart1:
			style.getPropertyValue('--chart-1').trim() || 'hsl(221.2 83.2% 53.3%)',
		chart2:
			style.getPropertyValue('--chart-2').trim() || 'hsl(217.2 91.2% 59.8%)',
		chart3:
			style.getPropertyValue('--chart-3').trim() || 'hsl(215.4 78.2% 51.4%)',
		chart4:
			style.getPropertyValue('--chart-4').trim() || 'hsl(213.1 94.2% 55.8%)',
		chart5:
			style.getPropertyValue('--chart-5').trim() || 'hsl(211.2 88.2% 52.3%)',
		muted:
			style.getPropertyValue('--muted-foreground').trim() ||
			'hsl(215.4 16.3% 46.9%)',
		card: style.getPropertyValue('--card').trim() || 'hsl(0 0% 100%)',
		border:
			style.getPropertyValue('--border').trim() || 'hsl(214.3 31.8% 91.4%)',
		foreground:
			style.getPropertyValue('--foreground').trim() || 'hsl(222.2 84% 4.9%)',
		background:
			style.getPropertyValue('--background').trim() || 'hsl(0 0% 100%)',
	}

	// Set up observer to clear cache when theme changes
	if (!themeObserver && typeof window !== 'undefined') {
		themeObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === 'attributes' &&
					(mutation.attributeName === 'class' ||
						mutation.attributeName === 'data-theme')
				) {
					// Clear cache when theme changes
					cachedColors = null
					break
				}
			}
		})

		// Observe html element for class changes (theme switching)
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'data-theme'],
		})
	}

	return cachedColors
}

/**
 * Format number for chart display
 */
export function formatChartValue(
	value: number,
	type: 'currency' | 'number' = 'number'
) {
	if (type === 'currency') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value)
	}

	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)
}

/**
 * Format date for chart axis
 */
export function formatChartDate(
	date: string,
	format: 'short' | 'long' = 'short'
) {
	const d = new Date(date)

	if (format === 'short') {
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})
	}

	return d.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}
