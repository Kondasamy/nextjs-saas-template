import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { getAuthUser } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export const createTRPCContext = async () => {
	const user = await getAuthUser()

	return {
		prisma,
		user,
	}
}

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		}
	},
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' })
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	})
})
