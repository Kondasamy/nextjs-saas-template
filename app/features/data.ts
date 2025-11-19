export type Hackathon = {
	winner:
		| 'winner'
		| 'loser'
		| 'finalist'
		| 'in-progress'
		| 'honorable-mention'
		| 'unknown'
	prize?: string
}

export type Thing = {
	uid: string
	title: string
	description?: string
	link: string
	url?: string
	cover: string
	youtube?: string
	tutorial?: string
	github?: string
	hackathon?: Hackathon
}

export const THINGS: Thing[] = [
	{
		uid: 'feature-1',
		title: 'Advanced Analytics Dashboard',
		description:
			'Get real-time insights into your business metrics with our powerful analytics engine. Track user behavior, conversion rates, and revenue growth all in one place.',
		link: '/features/analytics-dashboard',
		url: 'https://example.com/analytics',
		cover:
			'https://placehold.co/600x400/3b82f6/ffffff?text=Analytics+Dashboard',
		github: 'https://github.com/yourcompany/analytics',
	},
	{
		uid: 'feature-2',
		title: 'Team Collaboration Tools',
		description:
			'Seamlessly collaborate with your team in real-time. Share documents, chat, video call, and manage projects all within a unified workspace.',
		link: '/features/collaboration-tools',
		url: 'https://example.com/collaboration',
		cover:
			'https://placehold.co/600x400/10b981/ffffff?text=Collaboration+Tools',
		github: 'https://github.com/yourcompany/collaboration',
	},
	{
		uid: 'feature-3',
		title: 'API Integration Platform',
		description:
			'Connect your favorite tools and automate workflows with our extensive API integration platform. Support for 100+ popular services out of the box.',
		link: '/features/api-integration',
		url: 'https://example.com/api',
		cover: 'https://placehold.co/600x400/8b5cf6/ffffff?text=API+Integration',
		github: 'https://github.com/yourcompany/api-platform',
	},
	{
		uid: 'feature-4',
		title: 'Custom Reporting Engine',
		description:
			'Build custom reports tailored to your business needs. Export data in multiple formats and schedule automated report delivery.',
		link: '/features/reporting-engine',
		cover: 'https://placehold.co/600x400/f59e0b/ffffff?text=Reporting+Engine',
		github: 'https://github.com/yourcompany/reporting',
	},
]

// Alias for backward compatibility
export { THINGS as things }
