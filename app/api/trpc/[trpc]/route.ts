import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { appRouter } from '@/server/api/routers/_app'
import { createTRPCContext } from '@/server/api/trpc'

const handler = async (req: Request) => {
	try {
		// Apply rate limiting to all tRPC requests
		await checkRateLimit()

		return fetchRequestHandler({
			endpoint: '/api/trpc',
			req,
			router: appRouter,
			createContext: createTRPCContext,
			onError:
				process.env.NODE_ENV === 'development'
					? ({ path, error }) => {
							console.error(
								`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
							)
						}
					: undefined,
		})
	} catch (error: any) {
		// Handle rate limit errors
		if (error.statusCode === 429) {
			return NextResponse.json(
				{ error: error.message },
				{
					status: 429,
					headers: {
						'X-RateLimit-Remaining': error.remaining?.toString() || '0',
						'X-RateLimit-Reset': new Date(
							error.reset || Date.now()
						).toISOString(),
					},
				}
			)
		}
		throw error
	}
}

export { handler as GET, handler as POST }
