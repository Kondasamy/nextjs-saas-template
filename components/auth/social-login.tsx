'use client'

import { Chrome, Github } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth/client'

export function SocialLogin() {
	const handleSocialSignIn = async (
		provider: 'google' | 'github' | 'microsoft'
	) => {
		try {
			await signIn.social({
				provider,
				callbackURL: '/dashboard',
			})
		} catch {
			toast.error(`Failed to sign in with ${provider}`)
		}
	}

	return (
		<div className="space-y-2">
			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={() => handleSocialSignIn('google')}
			>
				<Chrome className="mr-2 h-4 w-4" />
				Continue with Google
			</Button>
			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={() => handleSocialSignIn('github')}
			>
				<Github className="mr-2 h-4 w-4" />
				Continue with GitHub
			</Button>
		</div>
	)
}
