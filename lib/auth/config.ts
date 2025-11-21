import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
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
		sendVerificationEmail: async ({ user, url }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendVerification(user.email, url)
				} else {
					console.log('📧 Verification email (RESEND_API_KEY not set):', {
						to: user.email,
						url,
					})
				}
			} catch (error) {
				console.error('Failed to send verification email:', error)
			}
		},
		sendResetPasswordEmail: async ({ user, url }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendPasswordReset(
						user.email,
						user.name || 'User',
						url
					)
				} else {
					console.log('📧 Password reset email (RESEND_API_KEY not set):', {
						to: user.email,
						url,
					})
				}
			} catch (error) {
				console.error('Failed to send password reset email:', error)
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
	magicLink: {
		enabled: true,
		sendEmail: async ({ email, url }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendMagicLink(email, url)
				} else {
					console.log('📧 Magic link email (RESEND_API_KEY not set):', {
						to: email,
						url,
					})
				}
			} catch (error) {
				console.error('Failed to send magic link email:', error)
			}
		},
	},
	passkey: {
		enabled: true,
	},
	otp: {
		enabled: true,
		sendEmail: async ({ email, otp }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.sendVerification(
						email,
						'',
						otp // Pass OTP as code
					)
				} else {
					console.log('📧 OTP email (RESEND_API_KEY not set):', {
						to: email,
						otp,
					})
				}
			} catch (error) {
				console.error('Failed to send OTP email:', error)
			}
		},
	},
	twoFactor: {
		enabled: true,
		sendEmail: async ({ email, otp, user }) => {
			try {
				if (env.RESEND_API_KEY) {
					await EmailService.send2FACode(email, user?.name || 'User', otp)
				} else {
					console.log('📧 2FA code email (RESEND_API_KEY not set):', {
						to: email,
						otp,
					})
				}
			} catch (error) {
				console.error('Failed to send 2FA code email:', error)
			}
		},
	},
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
		hooks: {
			after: [
				{
					matcher: (ctx) => ctx.path === '/api/auth/sign-up/email',
					handler: async (ctx) => {
						const user = ctx.context.session?.user
						if (user && env.RESEND_API_KEY) {
							try {
								await EmailService.sendWelcome(user.email, user.name || 'there')
							} catch (error) {
								console.error('Failed to send welcome email:', error)
							}
						} else if (user) {
							console.log('📧 Welcome email (RESEND_API_KEY not set):', {
								to: user.email,
							})
						}
					},
				},
			],
		},
	},
})

export type Session = typeof auth.$Infer.Session
