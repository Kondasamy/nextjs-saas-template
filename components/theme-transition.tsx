'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

interface ButtonPosition {
	x: number
	y: number
}

export function ThemeTransition({ children }: { children: React.ReactNode }) {
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(
		null
	)
	const [_transitionDirection, setTransitionDirection] = useState<
		'light-to-dark' | 'dark-to-light' | null
	>(null)
	const prevThemeRef = useRef<string | undefined>(theme)

	useEffect(() => {
		setMounted(true)
		prevThemeRef.current = theme

		// Listen for theme toggle events to get button position
		const handleThemeToggle = (event: CustomEvent<ButtonPosition>) => {
			setButtonPosition(event.detail)
		}

		window.addEventListener('theme-toggle', handleThemeToggle as EventListener)

		return () => {
			window.removeEventListener(
				'theme-toggle',
				handleThemeToggle as EventListener
			)
		}
	}, [])

	useEffect(() => {
		if (!mounted || !theme) return

		// Detect theme change
		if (
			theme !== prevThemeRef.current &&
			prevThemeRef.current &&
			buttonPosition
		) {
			// Determine transition direction
			const direction =
				prevThemeRef.current === 'light' ? 'light-to-dark' : 'dark-to-light'
			setTransitionDirection(direction)
			setIsTransitioning(true)
			// Reset after animation completes
			const timer = setTimeout(() => {
				setIsTransitioning(false)
				prevThemeRef.current = theme
				setButtonPosition(null)
				setTransitionDirection(null)
			}, 600)

			return () => clearTimeout(timer)
		}
	}, [theme, mounted, buttonPosition])

	if (!mounted) {
		return <>{children}</>
	}

	// Calculate the center point for the circular reveal
	// Use button position if available, otherwise default to top-right
	const getCenterPosition = () => {
		if (!buttonPosition || typeof window === 'undefined') {
			return {
				x: typeof window !== 'undefined' ? window.innerWidth - 50 : 0,
				y: 32,
			}
		}
		return buttonPosition
	}

	const center = getCenterPosition()

	// Calculate the maximum distance from center to corner for full coverage
	const getMaxDistance = () => {
		if (typeof window === 'undefined') return 2000

		const { x, y } = center
		const corners = [
			Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), // Top-left
			Math.sqrt(Math.pow(window.innerWidth - x, 2) + Math.pow(y, 2)), // Top-right
			Math.sqrt(Math.pow(x, 2) + Math.pow(window.innerHeight - y, 2)), // Bottom-left
			Math.sqrt(
				Math.pow(window.innerWidth - x, 2) + Math.pow(window.innerHeight - y, 2)
			), // Bottom-right
		]
		return Math.max(...corners) * 1.2 // Add 20% padding to ensure full coverage
	}

	const maxDistance = getMaxDistance()

	return (
		<>
			<AnimatePresence mode="wait">
				{isTransitioning && buttonPosition && (
					<motion.div
						key={`theme-transition-${theme}`}
						initial={{
							clipPath: `circle(0% at ${center.x}px ${center.y}px)`,
						}}
						animate={{
							clipPath: `circle(${maxDistance}px at ${center.x}px ${center.y}px)`,
						}}
						exit={{
							clipPath: `circle(0% at ${center.x}px ${center.y}px)`,
						}}
						transition={{
							duration: 0.6,
							ease: [0.4, 0, 0.2, 1],
						}}
						className="fixed inset-0 z-[9999] pointer-events-none"
						style={{
							background:
								theme === 'dark'
									? 'hsl(var(--background))'
									: 'hsl(var(--background))',
							willChange: 'clip-path',
							opacity: 0.98,
						}}
					/>
				)}
			</AnimatePresence>
			{children}
		</>
	)
}
