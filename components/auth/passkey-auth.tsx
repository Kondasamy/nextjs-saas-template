'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Key } from 'lucide-react'

export function PasskeyAuth() {
	const [isLoading, setIsLoading] = useState(false)

	const handlePasskeySignIn = async () => {
		setIsLoading(true)
		try {
			await signIn.passkey({
				callbackURL: '/dashboard',
			})
		} catch (error) {
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

