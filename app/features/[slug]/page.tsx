import { notFound } from 'next/navigation'
import { THINGS } from '../data'
import ThingClient from './ThingClient'

// Define params as a Promise that resolves to { slug: string }
export default async function ThingPage({
	params: paramsPromise,
}: {
	params: Promise<{ slug: string }>
}) {
	// Await the params promise to get the actual params object
	const params = await paramsPromise

	// Find thing by slug using a synchronous callback
	const thing = THINGS.find(
		(thing) => thing.link.split('/').pop() === params.slug
	)

	if (!thing) {
		notFound()
	}

	return (
		<ThingClient
			thing={{
				...thing,
				description: thing.description || '', // Ensure description is never undefined
			}}
		/>
	)
}
