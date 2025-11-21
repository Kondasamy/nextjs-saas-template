export type BlogPost = {
	uid: string
	title: string
	description: string
	link: string
	date: string
	author: string
	cover?: string
	tags?: string[]
}

export const blogPosts: BlogPost[] = [
	{
		uid: 'blog-1',
		title: 'Introducing Our New Features',
		description:
			'We are excited to announce the launch of several new features that will transform how you work. Learn about what is new and how to get started.',
		link: '/blog/new-features-announcement',
		date: '2024-03-15',
		author: 'Product Team',
		cover: 'https://placehold.co/1200x630/3b82f6/ffffff?text=New+Features',
		tags: ['product', 'announcement', 'features'],
	},
	{
		uid: 'blog-2',
		title: 'Best Practices for API Integration',
		description:
			'A comprehensive guide to integrating with our API efficiently and securely. Tips from our engineering team on common pitfalls and how to avoid them.',
		link: '/blog/api-best-practices',
		date: '2024-03-10',
		author: 'Engineering Team',
		cover:
			'https://placehold.co/1200x630/10b981/ffffff?text=API+Best+Practices',
		tags: ['technical', 'api', 'tutorial'],
	},
	{
		uid: 'blog-3',
		title: 'Company Update: Q1 2024',
		description:
			'Reflecting on our achievements this quarter and sharing our vision for what is coming next. Thank you to our amazing community for your continued support.',
		link: '/blog/q1-2024-update',
		date: '2024-03-01',
		author: 'CEO',
		cover: 'https://placehold.co/1200x630/8b5cf6/ffffff?text=Q1+Update',
		tags: ['company', 'update'],
	},
]

// Alias for backward compatibility
export const BLOG_POSTS = blogPosts
