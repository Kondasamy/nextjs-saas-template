import { TRPCError } from '@trpc/server'
import path from 'path'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'

// Allowed file extensions for different buckets
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
	avatars: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
	documents: ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'],
	images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
}

// Max file sizes per bucket (in bytes)
const MAX_FILE_SIZES: Record<string, number> = {
	avatars: 5 * 1024 * 1024, // 5MB
	documents: 10 * 1024 * 1024, // 10MB
	images: 10 * 1024 * 1024, // 10MB
}

// Validate and sanitize file path
function validateFilePath(filePath: string, bucket: string): void {
	// Prevent path traversal attacks
	const normalizedPath = path.normalize(filePath)
	if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid file path',
		})
	}

	// Check file extension if bucket has restrictions
	if (ALLOWED_EXTENSIONS[bucket]) {
		const ext = path.extname(normalizedPath).toLowerCase()
		if (!ALLOWED_EXTENSIONS[bucket].includes(ext)) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: `File type ${ext} not allowed for ${bucket} bucket`,
			})
		}
	}

	// Validate filename characters (alphanumeric, dash, underscore, dot)
	const filename = path.basename(normalizedPath)
	if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid filename characters',
		})
	}
}

export const storageRouter = createTRPCRouter({
	getUploadUrl: protectedProcedure
		.input(
			z.object({
				bucket: z.string().regex(/^[a-z0-9-]+$/), // Sanitize bucket name
				path: z.string().max(255), // Limit path length
				contentType: z.string().optional(),
				fileSize: z.number().optional(), // Add file size for validation
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Validate file path and extension
			validateFilePath(input.path, input.bucket)

			// Check file size if provided
			if (input.fileSize && MAX_FILE_SIZES[input.bucket]) {
				if (input.fileSize > MAX_FILE_SIZES[input.bucket]) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: `File size exceeds maximum allowed (${MAX_FILE_SIZES[input.bucket] / 1024 / 1024}MB)`,
					})
				}
			}

			const supabase = await createClient()

			const { data, error } = await supabase.storage
				.from(input.bucket)
				.createSignedUploadUrl(input.path, {
					upsert: false,
				})

			if (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message,
				})
			}

			return data
		}),

	getPublicUrl: protectedProcedure
		.input(
			z.object({
				bucket: z.string().regex(/^[a-z0-9-]+$/),
				path: z.string().max(255),
			})
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Validate file path
			validateFilePath(input.path, input.bucket)

			const supabase = await createClient()

			const { data } = supabase.storage
				.from(input.bucket)
				.getPublicUrl(input.path)

			return data
		}),

	deleteFile: protectedProcedure
		.input(
			z.object({
				bucket: z.string().regex(/^[a-z0-9-]+$/),
				path: z.string().max(255),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Validate file path
			validateFilePath(input.path, input.bucket)

			const supabase = await createClient()

			const { error } = await supabase.storage
				.from(input.bucket)
				.remove([input.path])

			if (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message,
				})
			}

			return { success: true }
		}),

	listFiles: protectedProcedure
		.input(
			z.object({
				bucket: z.string().regex(/^[a-z0-9-]+$/),
				path: z.string().max(255).optional(),
				limit: z.number().min(1).max(100).default(100),
			})
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			// Validate path if provided
			if (input.path) {
				validateFilePath(input.path, input.bucket)
			}

			const supabase = await createClient()

			const { data, error } = await supabase.storage
				.from(input.bucket)
				.list(input.path, {
					limit: input.limit,
					sortBy: { column: 'created_at', order: 'desc' },
				})

			if (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message,
				})
			}

			return data
		}),
})
