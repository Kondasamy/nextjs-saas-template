import { initTRPC, TRPCError } from '@trpc/server'
import { headers } from 'next/headers'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export const createTRPCContext = async () => {
	// next/headers works for both the HTTP handler and the server caller
	const h = await headers()
	const session = await getSession()

	return {
		prisma,
		user: session?.user ?? null,
		session: session?.session ?? null,
		ipAddress: h.get('x-forwarded-for') ?? undefined,
		userAgent: h.get('user-agent') ?? undefined,
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
