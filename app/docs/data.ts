type Social = {
	medium?: string
	dev?: string
	github?: string
	youtube?: string
	twitter?: string
	linkedin?: string
}

type Tutorial = {
	uid: string
	title: string
	description: string
	link: string
	cover: string
	socials?: Social
}

export type VideoTutorial = {
	uid: string
	title: string
	description: string
	link: string
	youtubeUrl: string
	cover?: string
	mediumUrl?: string
	devUrl?: string
	githubUrl?: string
	twitterUrl?: string
	linkedinUrl?: string
}

export const tutorials: Tutorial[] = [
	{
		uid: 'doc-1',
		title: 'Getting Started Guide',
		description:
			'Learn how to set up your account and start using our platform in under 5 minutes. This comprehensive guide covers all the basics you need to know.',
		link: '/docs/getting-started',
		cover: 'https://placehold.co/600x400/3b82f6/ffffff?text=Getting+Started',
		socials: {
			github: 'https://github.com/yourcompany/getting-started',
		},
	},
	{
		uid: 'doc-2',
		title: 'API Integration Tutorial',
		description:
			'Step-by-step tutorial on integrating our REST API into your application. Includes code examples in multiple programming languages.',
		link: '/docs/api-integration',
		cover: 'https://placehold.co/600x400/10b981/ffffff?text=API+Tutorial',
		socials: {
			github: 'https://github.com/yourcompany/api-examples',
		},
	},
	{
		uid: 'doc-3',
		title: 'Advanced Configuration',
		description:
			'Deep dive into advanced configuration options and best practices for optimizing your setup. For experienced users who want to get the most out of the platform.',
		link: '/docs/advanced-config',
		cover: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Advanced+Config',
		socials: {
			github: 'https://github.com/yourcompany/advanced-config',
		},
	},
]

export const videoTutorials: VideoTutorial[] = [
	{
		uid: 'video-1',
		title: 'Platform Overview',
		description:
			'Watch this 10-minute video to get a comprehensive overview of all platform features and capabilities.',
		link: '/docs/platform-overview',
		youtubeUrl: 'https://youtube.com/watch?v=example1',
		cover: 'https://placehold.co/600x400/f59e0b/ffffff?text=Platform+Overview',
		githubUrl: 'https://github.com/yourcompany/overview-demo',
	},
	{
		uid: 'video-2',
		title: 'Building Your First Integration',
		description:
			'Follow along as we build a complete integration from scratch. Includes downloadable source code and templates.',
		link: '/docs/first-integration',
		youtubeUrl: 'https://youtube.com/watch?v=example2',
		cover: 'https://placehold.co/600x400/ef4444/ffffff?text=First+Integration',
		githubUrl: 'https://github.com/yourcompany/integration-starter',
	},
]

// Export named exports for backward compatibility
export const VIDEO_TUTORIALS = videoTutorials
export const TUTORIALS = [...tutorials, ...videoTutorials]
