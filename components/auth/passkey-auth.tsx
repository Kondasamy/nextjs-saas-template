'use client'

import { Key } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth/client'

export function PasskeyAuth() {
	const [isLoading, setIsLoading] = useState(false)

	const handlePasskeySignIn = async () => {
		setIsLoading(true)
		try {
			await signIn.passkey()
		} catch {
			toast.error('Failed to sign in with passkey. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			onClick={handlePasskeySignIn}
			disabled={isLoading}
		>
			<Key className="mr-2 h-4 w-4" />
			{isLoading ? 'Signing in...' : 'Sign in with Passkey'}
		</Button>
	)
}
