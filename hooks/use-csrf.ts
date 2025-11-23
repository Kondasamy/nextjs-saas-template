'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to get CSRF token for client-side requests
 */
export function useCSRF() {
	const [token, setToken] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchToken() {
			try {
				const response = await fetch('/api/csrf')
				if (response.ok) {
					const data = await response.json()
					setToken(data.token)
				}
			} catch (error) {
				console.error('Failed to fetch CSRF token:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchToken()
	}, [])

	return { token, loading }
}

/**
 * Add CSRF token to fetch headers
 */
export function addCSRFHeader(
	headers: HeadersInit,
	token: string | null
): HeadersInit {
	if (!token) return headers

	if (headers instanceof Headers) {
		headers.set('x-csrf-token', token)
		return headers
	}

	if (Array.isArray(headers)) {
		return [...headers, ['x-csrf-token', token]]
	}

	return {
		...headers,
		'x-csrf-token': token,
	}
}
