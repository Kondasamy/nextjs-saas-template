import { passkey } from '@better-auth/passkey'
import bcrypt from 'bcrypt'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { magicLink } from 'better-auth/plugins/magic-link'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

// Validate Prisma client is properly initialized
if (!prisma) {
	throw new Error(
		'Prisma Client is not initialized. Please run `pnpm db:generate` to generate the Prisma client.'
	)
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql', // or whatever provider is used, but likely just empty object is enough if not required
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	basePath: '/api/auth',
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: env.NODE_ENV === 'production',
		password: {
			hash: async (password) => {
				return await bcrypt.hash(password, 10)
			},
			verify: async ({ hash, password }) => {
				return await bcrypt.compare(password, hash)
			},
		},
		sendResetPassword: async ({ user, url }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendPasswordReset(
						user.email,
						user.name || 'User',
						url
					)
				} else {
					logger.debug(
						'Password reset email skipped (RESEND_API_KEY not set)',
						{
							to: user.email,
						}
					)
				}
			} catch (error) {
				logger.error('Failed to send password reset email', error)
			}
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendVerification(user.email, url)
				} else {
					logger.debug('Verification email (RESEND_API_KEY not set)', {
						to: user.email,
						url,
					})
				}
			} catch (error) {
				logger.error('Failed to send verification email', error)
			}
		},
	},
	socialProviders: {
		google:
			env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
				? {
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET,
					}
				: undefined,
		github:
			env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
				? {
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET,
					}
				: undefined,
		microsoft:
			env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
				? {
						clientId: env.MICROSOFT_CLIENT_ID,
						clientSecret: env.MICROSOFT_CLIENT_SECRET,
					}
				: undefined,
	},
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				try {
					if (env.RESEND_API_KEY) {
						await EmailService.sendMagicLink(email, url)
					} else {
						logger.debug('Magic link email skipped (RESEND_API_KEY not set)', {
							to: email,
						})
					}
				} catch (error) {
					logger.error('Failed to send magic link email', error)
				}
			},
		}),
		// Replaces a top-level `otp` option that better-auth never read
		emailOTP({
			// OTP is a sign-in method only; new accounts go through sign-up and email verification
			disableSignUp: true,
			sendVerificationOTP: async ({ email, otp }) => {
				try {
					if (env.RESEND_API_KEY) {
						await EmailService.sendVerification(
							email,
							'',
							otp // Pass OTP as code
						)
					} else {
						logger.debug('OTP email skipped (RESEND_API_KEY not set)', {
							to: email,
						})
					}
				} catch (error) {
					logger.error('Failed to send OTP email', error)
				}
			},
		}),
		passkey({
			// Keep the existing Prisma field names the app already reads
			schema: {
				passkey: {
					fields: { name: 'deviceName', credentialID: 'credentialId' },
				},
			},
		}),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	advanced: {
		useSecureCookies: env.NODE_ENV === 'production',
		database: {
			generateId: () => {
				return `auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
			},
		},
	},
})

export type Session = typeof auth.$Infer.Session
