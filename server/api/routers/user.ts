import { z } from 'zod'
import { EmailService } from '@/lib/email/service'
import { logger } from '@/lib/logger'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.user.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					createdAt: true,
				},
			})
		}),

	getCurrent: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			return null
		}

		return ctx.prisma.user.findUnique({
			where: { id: ctx.user.id },
			select: {
				id: true,
				email: true,
				emailVerified: true,
				name: true,
				image: true,
				bio: true,
				timezone: true,
				language: true,
				createdAt: true,
				updatedAt: true,
				banned: true,
				organizations: {
					select: {
						joinedAt: true,
						organization: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
								logo: true,
							},
						},
						role: {
							select: {
								id: true,
								name: true,
								permissions: true,
							},
						},
					},
				},
			},
		})
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).optional(),
				image: z
					.string()
					.optional()
					.transform((val) => (val === '' ? undefined : val))
					.pipe(z.string().url().optional()),
				bio: z.string().max(500).optional(),
				timezone: z.string().optional(),
				language: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			return ctx.prisma.user.update({
				where: { id: ctx.user.id },
				data: {
					name: input.name,
					image: input.image,
					bio: input.bio,
					timezone: input.timezone,
					language: input.language,
				},
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					bio: true,
					timezone: true,
					language: true,
					updatedAt: true,
				},
			})
		}),

	deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		return ctx.prisma.user.delete({
			where: { id: ctx.user.id },
		})
	}),

	isAdmin: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			return false
		}

		const adminEmails =
			process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || []
		return adminEmails.includes(ctx.user.email)
	}),

	requestEmailChange: protectedProcedure
		.input(z.object({ newEmail: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Check if email is already in use by another user
			const existingUser = await ctx.prisma.user.findUnique({
				where: { email: input.newEmail },
			})

			if (existingUser) {
				throw new Error('This email is already in use')
			}

			// Generate verification token
			const token = crypto.randomUUID()
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

			// Store pending email change in Verification table
			await ctx.prisma.verification.create({
				data: {
					identifier: `email-change:${ctx.user.id}`,
					value: JSON.stringify({
						userId: ctx.user.id,
						newEmail: input.newEmail,
						token,
					}),
					expiresAt,
				},
			})

			// Send verification email to NEW email
			const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email-change?token=${token}`
			const userName = ctx.user.name || ctx.user.email.split('@')[0]

			try {
				await EmailService.sendEmailChangeVerification(
					input.newEmail,
					userName,
					verificationUrl
				)
			} catch (error) {
				logger.error('Failed to send verification email', error)
				// Continue anyway - user can still verify via URL
			}

			// Send notification to OLD email
			try {
				await EmailService.sendEmailChangeNotification(
					ctx.user.email,
					userName,
					input.newEmail
				)
			} catch (error) {
				logger.error('Failed to send notification email', error)
				// Continue anyway - not critical
			}

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'email_change_requested',
					metadata: JSON.stringify({
						oldEmail: ctx.user.email,
						newEmail: input.newEmail,
					}),
				},
			})

			return {
				success: true,
				message: 'Verification email sent to your new email address',
			}
		}),

	confirmEmailChange: protectedProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Find verification record
			const verification = await ctx.prisma.verification.findFirst({
				where: {
					identifier: `email-change:${ctx.user.id}`,
				},
			})

			if (!verification) {
				throw new Error('Invalid or expired verification token')
			}

			// Check if expired
			if (verification.expiresAt < new Date()) {
				await ctx.prisma.verification.delete({
					where: { id: verification.id },
				})
				throw new Error('Verification token has expired')
			}

			// Parse stored data
			const data = JSON.parse(verification.value)

			// Verify token matches
			if (data.token !== input.token) {
				throw new Error('Invalid verification token')
			}

			// Update user email
			const oldEmail = ctx.user.email
			await ctx.prisma.user.update({
				where: { id: ctx.user.id },
				data: { email: data.newEmail, emailVerified: true },
			})

			// Delete verification record
			await ctx.prisma.verification.delete({
				where: { id: verification.id },
			})

			// Invalidate all sessions (user will need to log in again with new email)
			await ctx.prisma.session.deleteMany({
				where: { userId: ctx.user.id },
			})

			// Send confirmation email to new email
			// TODO: Send confirmation email
			// await EmailService.sendEmailChangeConfirmation(data.newEmail)

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'email_changed',
					metadata: JSON.stringify({
						oldEmail,
						newEmail: data.newEmail,
					}),
				},
			})

			return {
				success: true,
				message: 'Email address changed successfully',
			}
		}),

	changePassword: protectedProcedure
		.input(
			z.object({
				currentPassword: z.string(),
				newPassword: z.string().min(8),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Get user's account with password
			const account = await ctx.prisma.account.findFirst({
				where: {
					userId: ctx.user.id,
					providerId: 'credential',
				},
			})

			if (!account || !account.password) {
				throw new Error('Password authentication not set up for this account')
			}

			// Verify current password using Better Auth's hash comparison
			// Note: Better Auth uses bcrypt for password hashing
			const bcrypt = require('bcrypt')
			const isValidPassword = await bcrypt.compare(
				input.currentPassword,
				account.password
			)

			if (!isValidPassword) {
				throw new Error('Current password is incorrect')
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(input.newPassword, 10)

			// Update password in database
			await ctx.prisma.account.update({
				where: { id: account.id },
				data: { password: hashedPassword },
			})

			// Get current session token to keep it active
			const currentSessionToken = ctx.session?.token

			// Invalidate all other sessions (keep current session active)
			await ctx.prisma.session.deleteMany({
				where: {
					userId: ctx.user.id,
					token: { not: currentSessionToken },
				},
			})

			// Send confirmation email
			try {
				const userName = ctx.user.name || ctx.user.email.split('@')[0]
				await EmailService.sendPasswordChanged(ctx.user.email, userName)
			} catch (error) {
				logger.error('Failed to send password changed email', error)
				// Continue anyway - password has been changed
			}

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'password_changed',
					metadata: JSON.stringify({
						sessionsInvalidated: true,
					}),
				},
			})

			return {
				success: true,
				message: 'Password changed successfully',
			}
		}),

	listSessions: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		const sessions = await ctx.prisma.session.findMany({
			where: { userId: ctx.user.id },
			orderBy: { lastActiveAt: 'desc' },
		})

		// Mark current session
		const currentSessionToken = ctx.session?.token

		return sessions.map((session) => ({
			id: session.id,
			deviceName: session.deviceName || 'Unknown Device',
			userAgent: session.userAgent || 'Unknown Browser',
			ipAddress: session.ipAddress || 'Unknown',
			lastActiveAt: session.lastActiveAt,
			createdAt: session.createdAt,
			isCurrent: session.token === currentSessionToken,
		}))
	}),

	revokeSession: protectedProcedure
		.input(z.object({ sessionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Verify session belongs to user
			const session = await ctx.prisma.session.findUnique({
				where: { id: input.sessionId },
			})

			if (!session) {
				throw new Error('Session not found')
			}

			if (session.userId !== ctx.user.id) {
				throw new Error('Unauthorized to revoke this session')
			}

			// Prevent revoking current session
			if (session.token === ctx.session?.token) {
				throw new Error('Cannot revoke current session')
			}

			// Delete session
			await ctx.prisma.session.delete({
				where: { id: input.sessionId },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'session_revoked',
					metadata: JSON.stringify({
						sessionId: input.sessionId,
						deviceName: session.deviceName,
						ipAddress: session.ipAddress,
					}),
				},
			})

			return {
				success: true,
				message: 'Session revoked successfully',
			}
		}),

	revokeAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		const currentSessionToken = ctx.session?.token

		// Delete all sessions except current
		const result = await ctx.prisma.session.deleteMany({
			where: {
				userId: ctx.user.id,
				token: { not: currentSessionToken },
			},
		})

		// Create audit log
		await ctx.prisma.auditLog.create({
			data: {
				userId: ctx.user.id,
				action: 'all_sessions_revoked',
				metadata: JSON.stringify({
					sessionsRevoked: result.count,
				}),
			},
		})

		// Send notification email
		try {
			const _userName = ctx.user.name || ctx.user.email.split('@')[0]
			// TODO: Send session revoked notification email
			// await EmailService.sendSessionsRevoked(ctx.user.email, userName, result.count)
		} catch (error) {
			logger.error('Failed to send sessions revoked email', error)
			// Continue anyway
		}

		return {
			success: true,
			message: `${result.count} session(s) revoked successfully`,
			count: result.count,
		}
	}),

	// Two-Factor Authentication
	setup2FA: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		// Check if 2FA is already enabled
		const existing = await ctx.prisma.twoFactorAuth.findUnique({
			where: { userId: ctx.user.id },
		})

		if (existing && existing.enabled) {
			throw new Error('Two-factor authentication is already enabled')
		}

		// Generate secret using speakeasy
		const speakeasy = require('speakeasy')
		const secret = speakeasy.generateSecret({
			name: `${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template'} (${ctx.user.email})`,
			length: 32,
		})

		// Generate backup codes (8 codes, 8 characters each)
		const backupCodes = Array.from({ length: 8 }, () =>
			crypto.randomBytes(4).toString('hex').toUpperCase()
		)

		// Hash backup codes before storing
		const bcrypt = require('bcrypt')
		const hashedBackupCodes = await Promise.all(
			backupCodes.map((code) => bcrypt.hash(code, 10))
		)

		// Store secret and backup codes (not enabled yet)
		await ctx.prisma.twoFactorAuth.upsert({
			where: { userId: ctx.user.id },
			create: {
				userId: ctx.user.id,
				secret: secret.base32,
				enabled: false,
				backupCodes: hashedBackupCodes,
			},
			update: {
				secret: secret.base32,
				enabled: false,
				backupCodes: hashedBackupCodes,
			},
		})

		// Generate QR code
		const QRCode = require('qrcode')
		const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url)

		return {
			secret: secret.base32,
			qrCode: qrCodeDataUrl,
			backupCodes, // Return plain text codes for user to save
		}
	}),

	verify2FA: protectedProcedure
		.input(z.object({ code: z.string().length(6) }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Get 2FA record
			const twoFactor = await ctx.prisma.twoFactorAuth.findUnique({
				where: { userId: ctx.user.id },
			})

			if (!twoFactor) {
				throw new Error('Two-factor authentication is not set up')
			}

			// Verify code using speakeasy
			const speakeasy = require('speakeasy')
			const verified = speakeasy.totp.verify({
				secret: twoFactor.secret,
				encoding: 'base32',
				token: input.code,
				window: 2, // Allow 2 time steps before/after
			})

			if (!verified) {
				throw new Error('Invalid verification code')
			}

			// Enable 2FA
			await ctx.prisma.twoFactorAuth.update({
				where: { userId: ctx.user.id },
				data: { enabled: true },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: '2fa_enabled',
					metadata: JSON.stringify({
						timestamp: new Date().toISOString(),
					}),
				},
			})

			return {
				success: true,
				message: 'Two-factor authentication enabled successfully',
			}
		}),

	disable2FA: protectedProcedure
		.input(z.object({ code: z.string().length(6) }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Get 2FA record
			const twoFactor = await ctx.prisma.twoFactorAuth.findUnique({
				where: { userId: ctx.user.id },
			})

			if (!twoFactor || !twoFactor.enabled) {
				throw new Error('Two-factor authentication is not enabled')
			}

			// Verify code using speakeasy
			const speakeasy = require('speakeasy')
			const verified = speakeasy.totp.verify({
				secret: twoFactor.secret,
				encoding: 'base32',
				token: input.code,
				window: 2,
			})

			if (!verified) {
				throw new Error('Invalid verification code')
			}

			// Delete 2FA record
			await ctx.prisma.twoFactorAuth.delete({
				where: { userId: ctx.user.id },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: '2fa_disabled',
					metadata: JSON.stringify({
						timestamp: new Date().toISOString(),
					}),
				},
			})

			return {
				success: true,
				message: 'Two-factor authentication disabled successfully',
			}
		}),

	get2FAStatus: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		const twoFactor = await ctx.prisma.twoFactorAuth.findUnique({
			where: { userId: ctx.user.id },
			select: {
				enabled: true,
				createdAt: true,
			},
		})

		return {
			enabled: twoFactor?.enabled || false,
			setupDate: twoFactor?.createdAt || null,
		}
	}),

	regenerateBackupCodes: protectedProcedure
		.input(z.object({ code: z.string().length(6) }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Get 2FA record
			const twoFactor = await ctx.prisma.twoFactorAuth.findUnique({
				where: { userId: ctx.user.id },
			})

			if (!twoFactor || !twoFactor.enabled) {
				throw new Error('Two-factor authentication is not enabled')
			}

			// Verify code
			const speakeasy = require('speakeasy')
			const verified = speakeasy.totp.verify({
				secret: twoFactor.secret,
				encoding: 'base32',
				token: input.code,
				window: 2,
			})

			if (!verified) {
				throw new Error('Invalid verification code')
			}

			// Generate new backup codes
			const backupCodes = Array.from({ length: 8 }, () =>
				crypto.randomBytes(4).toString('hex').toUpperCase()
			)

			// Hash backup codes
			const bcrypt = require('bcrypt')
			const hashedBackupCodes = await Promise.all(
				backupCodes.map((code) => bcrypt.hash(code, 10))
			)

			// Update backup codes
			await ctx.prisma.twoFactorAuth.update({
				where: { userId: ctx.user.id },
				data: { backupCodes: hashedBackupCodes },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: '2fa_backup_codes_regenerated',
					metadata: JSON.stringify({
						timestamp: new Date().toISOString(),
					}),
				},
			})

			return {
				success: true,
				backupCodes,
			}
		}),

	// Passkey Management
	listPasskeys: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		const passkeys = await ctx.prisma.passkey.findMany({
			where: { userId: ctx.user.id },
			orderBy: { lastUsedAt: 'desc' },
		})

		return passkeys.map((passkey) => ({
			id: passkey.id,
			credentialId: passkey.credentialId,
			deviceName: passkey.deviceName || 'Unknown Device',
			createdAt: passkey.createdAt,
			lastUsedAt: passkey.lastUsedAt,
		}))
	}),

	renamePasskey: protectedProcedure
		.input(
			z.object({
				passkeyId: z.string(),
				name: z.string().min(1).max(100),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Verify passkey belongs to user
			const passkey = await ctx.prisma.passkey.findUnique({
				where: { id: input.passkeyId },
			})

			if (!passkey) {
				throw new Error('Passkey not found')
			}

			if (passkey.userId !== ctx.user.id) {
				throw new Error('Unauthorized to rename this passkey')
			}

			// Update passkey name
			await ctx.prisma.passkey.update({
				where: { id: input.passkeyId },
				data: { deviceName: input.name },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'passkey_renamed',
					metadata: JSON.stringify({
						passkeyId: input.passkeyId,
						newName: input.name,
					}),
				},
			})

			return {
				success: true,
				message: 'Passkey renamed successfully',
			}
		}),

	removePasskey: protectedProcedure
		.input(z.object({ passkeyId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			// Verify passkey belongs to user
			const passkey = await ctx.prisma.passkey.findUnique({
				where: { id: input.passkeyId },
			})

			if (!passkey) {
				throw new Error('Passkey not found')
			}

			if (passkey.userId !== ctx.user.id) {
				throw new Error('Unauthorized to remove this passkey')
			}

			// Delete passkey
			await ctx.prisma.passkey.delete({
				where: { id: input.passkeyId },
			})

			// Create audit log
			await ctx.prisma.auditLog.create({
				data: {
					userId: ctx.user.id,
					action: 'passkey_removed',
					metadata: JSON.stringify({
						passkeyId: input.passkeyId,
						deviceName: passkey.deviceName,
					}),
				},
			})

			return {
				success: true,
				message: 'Passkey removed successfully',
			}
		}),

	// GDPR: Export account data
	exportAccountData: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('Unauthorized')
		}

		// Gather all user data
		const [profile, organizations, notifications, auditLogs, sessions] =
			await Promise.all([
				// Profile data
				ctx.prisma.user.findUnique({
					where: { id: ctx.user.id },
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
						bio: true,
						timezone: true,
						language: true,
						emailVerified: true,
						createdAt: true,
						updatedAt: true,
					},
				}),

				// Organization memberships
				ctx.prisma.organizationMember.findMany({
					where: { userId: ctx.user.id },
					include: {
						organization: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
								createdAt: true,
							},
						},
						role: {
							select: {
								id: true,
								name: true,
								permissions: true,
							},
						},
					},
				}),

				// Notifications
				ctx.prisma.notification.findMany({
					where: { userId: ctx.user.id },
					orderBy: { createdAt: 'desc' },
					take: 100, // Limit to recent 100 notifications
				}),

				// Audit logs
				ctx.prisma.auditLog.findMany({
					where: { userId: ctx.user.id },
					orderBy: { createdAt: 'desc' },
					take: 100, // Limit to recent 100 audit logs
				}),

				// Active sessions
				ctx.prisma.session.findMany({
					where: { userId: ctx.user.id },
					select: {
						id: true,
						deviceName: true,
						ipAddress: true,
						userAgent: true,
						createdAt: true,
						lastActiveAt: true,
						expiresAt: true,
					},
				}),
			])

		// Format export data
		const exportData = {
			exportDate: new Date().toISOString(),
			profile,
			organizations: organizations.map((membership) => ({
				organization: membership.organization,
				role: membership.role,
				joinedAt: membership.createdAt,
			})),
			notifications,
			auditLogs: auditLogs.map((log) => ({
				action: log.action,
				metadata: log.metadata,
				createdAt: log.createdAt,
			})),
			sessions,
		}

		// Create audit log for export request
		await ctx.prisma.auditLog.create({
			data: {
				userId: ctx.user.id,
				action: 'account_data_exported',
				metadata: JSON.stringify({
					timestamp: new Date().toISOString(),
					recordCount: {
						notifications: notifications.length,
						auditLogs: auditLogs.length,
						sessions: sessions.length,
						organizations: organizations.length,
					},
				}),
			},
		})

		return {
			success: true,
			data: exportData,
			message: 'Account data exported successfully',
		}
	}),

	// User Activity History
	getUserActivityLog: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			})
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error('Unauthorized')
			}

			const [logs, total] = await Promise.all([
				ctx.prisma.auditLog.findMany({
					where: { userId: ctx.user.id },
					orderBy: { createdAt: 'desc' },
					take: input.limit,
					skip: input.offset,
					select: {
						id: true,
						action: true,
						createdAt: true,
						ipAddress: true,
						userAgent: true,
						metadata: true,
						organizationId: true,
					},
				}),
				ctx.prisma.auditLog.count({
					where: { userId: ctx.user.id },
				}),
			])

			return {
				logs,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),
})
