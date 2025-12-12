import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins/magic-link'
import { passkey } from '@better-auth/passkey'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

/**
 * Creates a default workspace for a new user
 */
async function createDefaultWorkspace(user: {
	id: string
	email: string
	name?: string | null
}) {
	try {
		logger.info('Creating default workspace for user', {
			userId: user.id,
			email: user.email,
		})

		// Check if user already has a workspace
		const existingMembership = await prisma.organizationMember.findFirst({
			where: { userId: user.id },
		})

		if (existingMembership) {
			logger.debug('User already has a workspace, skipping creation', {
				userId: user.id,
			})
			return
		}

		// Generate a unique slug from user's email or name
		const baseSlug = user.email
			.split('@')[0]
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 30)

		// Ensure slug is unique
		let slug = baseSlug
		let counter = 1
		while (
			await prisma.organization.findUnique({
				where: { slug },
			})
		) {
			slug = `${baseSlug}-${counter}`
			counter++
		}

		// Create default workspace
		const workspaceName = user.name || `${user.email.split('@')[0]}'s Workspace`
		logger.info('Creating workspace', { name: workspaceName, slug })

		const workspace = await prisma.organization.create({
			data: {
				name: workspaceName,
				slug,
				description: 'My default workspace',
				members: {
					create: {
						userId: user.id,
						role: {
							create: {
								name: 'Owner',
								description: 'Workspace owner with full access',
								permissions: ['*'], // All permissions
								isSystem: true,
							},
						},
					},
				},
			},
		})

		logger.info('Default workspace created successfully', {
			workspaceId: workspace.id,
		})
	} catch (error) {
		logger.error('Failed to create default workspace', error)
		// Don't fail signup if workspace creation fails
	}
}

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
					logger.debug('Verification email (RESEND_API_KEY not set)', {
						to: user.email,
						url,
					})
				}
			} catch (error) {
				logger.error('Failed to send verification email', error)
			}
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
		passkey(),
	],
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
					logger.debug('OTP email skipped (RESEND_API_KEY not set)', {
						to: email,
					})
				}
			} catch (error) {
				logger.error('Failed to send OTP email', error)
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
					logger.debug('2FA code email skipped (RESEND_API_KEY not set)', {
						to: email,
					})
				}
			} catch (error) {
				logger.error('Failed to send 2FA code email', error)
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
					// Handle email/password signup - check response for new user
					matcher: (ctx) => {
						const isSignup = ctx.path === '/api/auth/sign-up/email'
						if (isSignup) {
							logger.debug('Signup hook triggered', {
								path: ctx.path,
								method: ctx.req?.method,
								hasSession: !!ctx.context.session,
								userId: ctx.context.session?.user?.id,
							})
						}
						return isSignup
					},
					handler: async (ctx) => {
						logger.debug('Signup handler running')

						// Try to get the user from session or response
						let user = ctx.context.session?.user

						// If no user in session, try to get from response
						if (!user) {
							logger.debug('No user in session, checking response')
							const response = ctx.response
							if (
								response &&
								typeof response === 'object' &&
								'user' in response
							) {
								user = (response as any).user
							}
						}

						// Only proceed if we have a confirmed user context
						// Never try to guess or find users by time - this is unsafe
						if (!user) {
							logger.debug(
								'No user context available, workspace will be created on first authenticated access'
							)
							return
						}

						logger.debug('User found, creating workspace', {
							userId: user.id,
							email: user.email,
						})
						await createDefaultWorkspace(user)

						// Send welcome email
						if (env.RESEND_API_KEY) {
							try {
								await EmailService.sendWelcome(user.email, user.name || 'there')
							} catch (error) {
								logger.error('Failed to send welcome email', error)
							}
						} else {
							logger.debug('Welcome email skipped (RESEND_API_KEY not set)', {
								to: user.email,
							})
						}
					},
				},
				{
					// Handle OAuth signup (Google, GitHub, Microsoft)
					matcher: (ctx) => {
						const isOAuthCallback = ctx.path.startsWith('/api/auth/callback/')
						if (isOAuthCallback) {
							logger.debug('OAuth callback hook triggered', {
								path: ctx.path,
								hasSession: !!ctx.context.session,
								userId: ctx.context.session?.user?.id,
							})
						}
						return isOAuthCallback && !!ctx.context.session?.user
					},
					handler: async (ctx) => {
						logger.debug('OAuth callback handler running')
						const user = ctx.context.session?.user
						if (!user) {
							logger.debug('No user in OAuth callback session')
							return
						}

						// Check if this is a new user (first time OAuth login)
						// We check by seeing if they have any workspaces
						const membershipCount = await prisma.organizationMember.count({
							where: { userId: user.id },
						})

						logger.debug('User workspace count', { count: membershipCount })

						// If no workspaces exist, this is likely a new user
						if (membershipCount === 0) {
							logger.debug('New OAuth user detected, creating workspace', {
								userId: user.id,
							})
							await createDefaultWorkspace(user)

							// Send welcome email for new OAuth users
							if (env.RESEND_API_KEY) {
								try {
									await EmailService.sendWelcome(
										user.email,
										user.name || 'there'
									)
								} catch (error) {
									logger.error('Failed to send welcome email', error)
								}
							}
						} else {
							logger.debug('Existing user, skipping workspace creation')
						}
					},
				},
			],
		},
	},
})

export type Session = typeof auth.$Infer.Session
