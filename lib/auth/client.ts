'use client'

import { magicLinkClient, passkeyClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from '@/lib/env'

export const authClient = createAuthClient({
	baseURL: env.BETTER_AUTH_URL,
	plugins: [magicLinkClient(), passkeyClient()],
})

export const { signIn, signUp, signOut, useSession, useUser } = authClient
