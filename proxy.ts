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

	// Check if route is public
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// Get auth session
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	// Redirect authenticated users away from auth pages
	if (isAuthRoute && session?.user) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	// Redirect unauthenticated users to login
	if (!isPublicRoute && !session?.user) {
		const redirectUrl = new URL('/login', request.url)
		redirectUrl.searchParams.set('redirect', pathname)
		return NextResponse.redirect(redirectUrl)
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
