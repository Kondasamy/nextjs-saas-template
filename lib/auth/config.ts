import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { EmailService } from '@/lib/email/service'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

/**
 * Creates a default workspace for a new user
 */
async function createDefaultWorkspace(user: { id: string; email: string; name?: string | null }) {
	try {
		console.log('🏗️ Creating default workspace for user:', user.id, user.email)

		// Check if user already has a workspace
		const existingMembership = await prisma.organizationMember.findFirst({
			where: { userId: user.id },
		})

		if (existingMembership) {
			console.log('ℹ️ User already has a workspace, skipping creation')
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
		console.log('📝 Creating workspace:', { name: workspaceName, slug })

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

		console.log('✅ Default workspace created successfully:', workspace.id)
	} catch (error) {
		console.error('❌ Failed to create default workspace:', error)
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
					// Handle email/password signup - check response for new user
					matcher: (ctx) => {
						const isSignup = ctx.path === '/api/auth/sign-up/email'
						if (isSignup) {
							console.log('🔍 Signup hook triggered:', {
								path: ctx.path,
								method: ctx.req?.method,
								hasSession: !!ctx.context.session,
								userId: ctx.context.session?.user?.id,
							})
						}
						return isSignup
					},
					handler: async (ctx) => {
						console.log('🚀 Signup handler running...')
						
						// Try multiple ways to get the user
						let user = ctx.context.session?.user

						// If no user in session, try to get from response or find by checking recent users
						if (!user) {
							console.log('⚠️ No user in session, checking response...')
							// The response might have the user data
							const response = ctx.response
							if (response && typeof response === 'object' && 'user' in response) {
								user = (response as any).user
							}
						}

						// If still no user, try to find the most recently created user
						// This is a fallback - not ideal but should work
						if (!user) {
							console.log('⚠️ Still no user, checking for recently created user...')
							// Get email from request if possible (this might not work if body is already read)
							try {
								// Find the most recently created user (within last 5 seconds)
								const recentUser = await prisma.user.findFirst({
									where: {
										createdAt: {
											gte: new Date(Date.now() - 5000), // Last 5 seconds
										},
									},
									orderBy: {
										createdAt: 'desc',
									},
								})

								if (recentUser) {
									// Check if this user already has a workspace
									const hasWorkspace = await prisma.organizationMember.findFirst({
										where: { userId: recentUser.id },
									})

									if (!hasWorkspace) {
										console.log('✅ Found recent user without workspace:', recentUser.id)
										user = recentUser
									}
								}
							} catch (error) {
								console.error('Error finding recent user:', error)
							}
						}

						if (!user) {
							console.log('❌ Could not find user for workspace creation')
							return
						}

						console.log('✅ User found:', user.id, user.email)
						await createDefaultWorkspace(user)

						// Send welcome email
						if (env.RESEND_API_KEY) {
							try {
								await EmailService.sendWelcome(user.email, user.name || 'there')
							} catch (error) {
								console.error('Failed to send welcome email:', error)
							}
						} else {
							console.log('📧 Welcome email (RESEND_API_KEY not set):', {
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
							console.log('🔍 OAuth callback hook triggered:', {
								path: ctx.path,
								hasSession: !!ctx.context.session,
								userId: ctx.context.session?.user?.id,
							})
						}
						return isOAuthCallback && !!ctx.context.session?.user
					},
					handler: async (ctx) => {
						console.log('🚀 OAuth callback handler running...')
						const user = ctx.context.session?.user
						if (!user) {
							console.log('❌ No user in OAuth callback session')
							return
						}

						// Check if this is a new user (first time OAuth login)
						// We check by seeing if they have any workspaces
						const membershipCount = await prisma.organizationMember.count({
							where: { userId: user.id },
						})

						console.log('📊 User workspace count:', membershipCount)

						// If no workspaces exist, this is likely a new user
						if (membershipCount === 0) {
							console.log('✅ New OAuth user detected, creating workspace...')
							await createDefaultWorkspace(user)

							// Send welcome email for new OAuth users
							if (env.RESEND_API_KEY) {
								try {
									await EmailService.sendWelcome(
										user.email,
										user.name || 'there'
									)
								} catch (error) {
									console.error('Failed to send welcome email:', error)
								}
							}
						} else {
							console.log('ℹ️ Existing user, skipping workspace creation')
						}
					},
				},
			],
		},
	},
})

export type Session = typeof auth.$Infer.Session
