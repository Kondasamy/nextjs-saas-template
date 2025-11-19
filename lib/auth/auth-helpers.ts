import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './config'

export async function requireAuth() {
	const h = await headers()
	const session = await auth.api.getSession({
		headers: h,
	})

	if (!session?.user) {
		redirect('/login')
	}

	return session
}

export async function getAuthSession() {
	const h = await headers()
	return auth.api.getSession({
		headers: h,
	})
}

export async function getAuthUser() {
	const session = await getAuthSession()
	return session?.user ?? null
}
