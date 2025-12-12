'use client'

import { magicLinkClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	plugins: [magicLinkClient(), passkeyClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
