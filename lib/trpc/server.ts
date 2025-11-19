import { createCallerFactory } from '@trpc/server'
import { appRouter } from '@/server/api/routers/_app'
import { createTRPCContext } from '@/server/api/trpc'

const createCaller = createCallerFactory(appRouter)

export async function createServerCaller() {
	const ctx = await createTRPCContext()
	return createCaller(ctx)
}
