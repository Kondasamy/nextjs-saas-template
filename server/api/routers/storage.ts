import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export const storageRouter = createTRPCRouter({
	getUploadUrl: protectedProcedure
		.input(
			z.object({
				bucket: z.string(),
				path: z.string(),
				contentType: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
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
				bucket: z.string(),
				path: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

			const supabase = await createClient()

			const { data } = supabase.storage.from(input.bucket).getPublicUrl(input.path)

			return data
		}),

	deleteFile: protectedProcedure
		.input(
			z.object({
				bucket: z.string(),
				path: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}

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
				bucket: z.string(),
				path: z.string().optional(),
				limit: z.number().min(1).max(100).default(100),
			})
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
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

