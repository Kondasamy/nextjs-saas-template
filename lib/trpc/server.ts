import { appRouter } from '@/server/api/routers/_app'
import { createTRPCContext } from '@/server/api/trpc'

export async function createServerCaller() {
	const ctx = await createTRPCContext()
	return appRouter.createCaller(ctx)
}
