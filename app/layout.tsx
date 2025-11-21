import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { TRPCProvider } from '@/components/providers/trpc-provider'
import { ThemeStyles } from '@/components/theme-styles'
import { ThemeTransition } from '@/components/theme-transition'
import { cn } from '@/lib/utils'
import { WorkspaceProvider } from '@/lib/workspace/workspace-context'

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#ffffff',
}

export const metadata: Metadata = {
	title: 'Your SaaS Platform',
	description:
		'Build, deploy, and scale your applications with our powerful platform. Everything you need to succeed in one place.',
	metadataBase: new URL('https://yoursaas.com/'),
	keywords: [
		'saas',
		'platform',
		'api',
		'analytics',
		'collaboration',
		'integration',
	],

	alternates: {
		canonical: '/',
	},

	authors: [
		{
			name: 'Your Company',
			url: 'https://github.com/yourcompany',
		},
	],

	openGraph: {
		title: 'Your SaaS Platform',
		description:
			'Build, deploy, and scale your applications with our powerful platform.',
		type: 'website',
		url: '/',
		images: [
			{
				url: 'https://placehold.co/1200x630/3b82f6/ffffff?text=Your+SaaS+Platform',
				width: 1200,
				height: 630,
				alt: 'Your SaaS Platform',
			},
		],
	},

	icons: {
		icon: '/favicon.ico',
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Your SaaS Platform',
		description:
			'Build, deploy, and scale your applications with our powerful platform.',
		images: [
			'https://placehold.co/1200x630/3b82f6/ffffff?text=Your+SaaS+Platform',
		],
		site: '@yourcompany',
		creator: '@yourcompany',
	},

	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
		},
	},

	appleWebApp: {
		title: 'Your SaaS Platform',
		statusBarStyle: 'black-translucent',
	},

	appLinks: {
		web: {
			url: 'https://yoursaas.com',
			should_fallback: true,
		},
	},
}

const geist = Geist({
	variable: '--font-geist',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html className="bg-sidebar" lang="en" suppressHydrationWarning>
			<head>
				<ThemeStyles />
				{/* Load Google Fonts for theme typography */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Montserrat:ital,wght@0,100..900;1,100..900&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lora:ital,wght@0,400..700;1,400..700&family=Fira+Code:wght@300..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={cn(
					'min-h-screen bg-sidebar antialiased overflow-x-hidden',
					geist.variable,
					geistMono.variable
				)}
				style={{ fontFamily: 'var(--font-sans)' }}
			>
				<TRPCProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						<WorkspaceProvider>
							<ThemeTransition>
								{children}
								<Toaster />
							</ThemeTransition>
						</WorkspaceProvider>
					</ThemeProvider>
				</TRPCProvider>
			</body>
		</html>
	)
}
