import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export const auth = betterAuth({
	database: prismaAdapter(prisma),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	basePath: '/api/auth',
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	socialProviders: {
		google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
			? {
					clientId: env.GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
				}
			: undefined,
		github: env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? {
					clientId: env.GITHUB_CLIENT_ID,
					clientSecret: env.GITHUB_CLIENT_SECRET,
				}
			: undefined,
		microsoft: env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
			? {
					clientId: env.MICROSOFT_CLIENT_ID,
					clientSecret: env.MICROSOFT_CLIENT_SECRET,
				}
			: undefined,
	},
	magicLink: {
		enabled: true,
	},
	passkey: {
		enabled: true,
	},
	otp: {
		enabled: true,
	},
	twoFactor: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	advanced: {
		useSecureCookies: env.NODE_ENV === 'production',
		generateId: () => {
			return `auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
		},
	},
})

export type Session = typeof auth.$Infer.Session

