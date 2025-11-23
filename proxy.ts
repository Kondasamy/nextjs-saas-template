import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = [
	'/login',
	'/signup',
	'/forgot-password',
	'/verify-email',
	'/verify-otp',
]
const authRoutes = [
	'/login',
	'/signup',
	'/forgot-password',
	'/verify-email',
	'/verify-otp',
]

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Update Supabase session
	const supabaseResponse = await updateSession(request)

	// Add security headers to response
	const cspHeader = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://va.vercel-scripts.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: blob: https: http:",
		"font-src 'self' data: https://fonts.gstatic.com",
		"connect-src 'self' https://api.github.com https://api.dicebear.com https://*.supabase.co https://*.googleapis.com wss://*.supabase.co",
		"media-src 'self'",
		"object-src 'none'",
		"child-src 'self'",
		"frame-src 'self' https://challenges.cloudflare.com",
		"worker-src 'self' blob:",
		"form-action 'self'",
		"frame-ancestors 'self'",
		"base-uri 'self'",
		"manifest-src 'self'",
		process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
	]
		.filter(Boolean)
		.join('; ')

	const securityHeaders = {
		'X-DNS-Prefetch-Control': 'on',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
		'X-Frame-Options': 'SAMEORIGIN',
		'X-Content-Type-Options': 'nosniff',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy':
			'camera=(), microphone=(), geolocation=(), interest-cohort=()',
		'Content-Security-Policy': cspHeader,
	}

	Object.entries(securityHeaders).forEach(([key, value]) => {
		supabaseResponse.headers.set(key, value)
	})

	// Check if route is public
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// Get auth session
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	// Redirect authenticated users away from auth pages
	if (isAuthRoute && session?.user) {
		const redirect = NextResponse.redirect(new URL('/', request.url))
		Object.entries(securityHeaders).forEach(([key, value]) => {
			redirect.headers.set(key, value)
		})
		return redirect
	}

	// Redirect unauthenticated users to login
	if (!isPublicRoute && !session?.user) {
		const redirectUrl = new URL('/login', request.url)
		redirectUrl.searchParams.set('redirect', pathname)
		const redirect = NextResponse.redirect(redirectUrl)
		Object.entries(securityHeaders).forEach(([key, value]) => {
			redirect.headers.set(key, value)
		})
		return redirect
	}

	return supabaseResponse
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
