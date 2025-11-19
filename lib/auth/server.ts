import { auth } from './config'
import { headers } from 'next/headers'

export async function getSession() {
	const h = await headers()
	return auth.api.getSession({
		headers: h,
	})
}

export async function getUser() {
	const session = await getSession()
	return session?.user ?? null
}

export async function requireAuth() {
	const session = await getSession()
	if (!session?.user) {
		throw new Error('Unauthorized')
	}
	return session
}

