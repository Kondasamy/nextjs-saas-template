import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { TRPCProvider } from '@/components/providers/trpc-provider'
import { cn } from '@/lib/utils'

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
			<head />
			<body
				className={cn(
					'min-h-screen bg-sidebar font-sans antialiased overflow-x-hidden',
					geist.variable,
					geistMono.variable
				)}
			>
				<TRPCProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster />
					</ThemeProvider>
				</TRPCProvider>
			</body>
		</html>
	)
}
