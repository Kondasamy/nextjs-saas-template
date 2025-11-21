'use client'

import {
	BookOpen,
	Boxes,
	MoonStar,
	Settings2,
	Shield,
	SquareTerminal,
	SunDim,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { useEffect, useState } from 'react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function PageHeader() {
	const pathname = usePathname()

	// Get page title and icon based on current route
	const getPageInfo = () => {
		if (pathname === '/') {
			return {
				title: 'Dashboard',
				icon: <SquareTerminal className="h-5 w-5" />,
			}
		} else if (pathname.startsWith('/docs')) {
			return {
				title: 'Documentation',
				icon: <BookOpen className="h-5 w-5" />,
			}
		} else if (pathname.startsWith('/features')) {
			return {
				title: 'Features',
				icon: <Boxes className="h-5 w-5" />,
			}
		} else if (pathname.startsWith('/blog')) {
			return {
				title: 'Blog',
				icon: <BookOpen className="h-5 w-5" />,
			}
		} else if (pathname.startsWith('/settings')) {
			return {
				title: 'Settings',
				icon: <Settings2 className="h-5 w-5" />,
			}
		} else if (pathname.startsWith('/admin')) {
			return {
				title: 'Admin',
				icon: <Shield className="h-5 w-5" />,
			}
		} else {
			return {
				title: 'Dashboard',
				icon: <SquareTerminal className="h-5 w-5" />,
			}
		}
	}

	const { title, icon } = getPageInfo()
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const buttonRef = React.useRef<HTMLButtonElement>(null)

	// Only set mounted state, don't force theme
	useEffect(() => {
		setMounted(true)
	}, [])

	const handleThemeToggle = () => {
		// Store button position before theme change
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const x = rect.left + rect.width / 2
			const y = rect.top + rect.height / 2

			// Store position in a custom event or sessionStorage for the transition component
			window.dispatchEvent(
				new CustomEvent('theme-toggle', {
					detail: { x, y },
				})
			)
		}
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}

	// Prevent hydration mismatch
	if (!mounted) return null

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 justify-between">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1 cursor-pointer" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem className="hidden md:block">
							<BreadcrumbLink
								href={
									pathname === '/'
										? '/'
										: `/${pathname.split('/').filter(Boolean)[0]}`
								}
							>
								<div className="flex items-center gap-2">
									{icon}
									<span>{title}</span>
								</div>
							</BreadcrumbLink>
						</BreadcrumbItem>
						{pathname !== '/' &&
							pathname.split('/').filter(Boolean).length > 1 && (
								<>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>
											<BreadcrumbLink href={pathname}>
												{pathname
													.split('/')
													.filter(Boolean)[1]
													.split('-')
													.map(
														(word) =>
															word.charAt(0).toUpperCase() + word.slice(1)
													)
													.join(' ')}
											</BreadcrumbLink>
										</BreadcrumbPage>
									</BreadcrumbItem>
								</>
							)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className="flex items-center px-4">
				<Button
					ref={buttonRef}
					variant="ghost"
					size="icon"
					className="cursor-pointer"
					onClick={handleThemeToggle}
				>
					{theme === 'dark' ? (
						<MoonStar className="h-5 w-5" />
					) : (
						<SunDim className="h-5 w-5" />
					)}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</div>
		</header>
	)
}
