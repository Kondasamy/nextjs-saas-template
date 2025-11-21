import { Calendar, User } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { blogPosts } from '../data'

type Props = {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const resolvedParams = await params
	const post = blogPosts.find(
		(post) => post.link.split('/').pop() === resolvedParams.slug
	)

	if (!post) {
		return {
			title: 'Post Not Found',
		}
	}

	return {
		title: post.title,
		description: post.description,
	}
}

export default async function BlogPostPage({ params }: Props) {
	const resolvedParams = await params
	const post = blogPosts.find(
		(post) => post.link.split('/').pop() === resolvedParams.slug
	)

	if (!post) {
		notFound()
	}

	return (
		<div className="container max-w-4xl mx-auto py-8 px-4">
			<article className="prose prose-zinc dark:prose-invert max-w-none">
				<div className="mb-8 space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>

					<div className="flex items-center gap-4 text-muted-foreground">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4" />
							<span className="text-sm">{post.author}</span>
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<time className="text-sm" dateTime={post.date}>
								{new Date(post.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</time>
						</div>
					</div>

					{post.tags && post.tags.length > 0 && (
						<div className="flex gap-2 flex-wrap">
							{post.tags.map((tag) => (
								<Badge key={tag} variant="secondary">
									{tag}
								</Badge>
							))}
						</div>
					)}
				</div>

				<div className="space-y-4">
					<p className="text-lg text-muted-foreground">{post.description}</p>

					<div className="my-8 p-6 bg-muted rounded-lg">
						<p className="text-center text-muted-foreground">
							📝 Blog post content goes here. Add your content using MDX or a
							CMS.
						</p>
					</div>

					<div className="space-y-4">
						<h2>About this post</h2>
						<p>
							This is a placeholder blog post. Replace this content with your
							actual blog post content. You can use MDX for rich content, or
							integrate with a headless CMS like Contentful, Sanity, or Strapi.
						</p>
					</div>
				</div>
			</article>
		</div>
	)
}
