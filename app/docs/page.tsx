'use client'

import {
	BookOpen,
	ChevronRight,
	Github,
	Linkedin,
	ListCollapse,
	PenBox,
	PlayCircle,
	Twitter,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { TUTORIALS, VIDEO_TUTORIALS } from './data'

// Type definitions to match data.ts
type Tutorial = (typeof TUTORIALS)[0]
type VideoTutorial = (typeof VIDEO_TUTORIALS)[0]

// Card that handles navigation but allows button clicks without nesting <a> tags
function TutorialCard({ tutorial }: { tutorial: Tutorial | VideoTutorial }) {
	const router = useRouter()

	const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Only navigate if the click was directly on the card, not on a button
		if ((e.target as HTMLElement).closest('button')) {
			return
		}
		router.push(tutorial.link)
	}

	// Check if tutorial has YouTube links
	const hasYoutube =
		'youtubeUrl' in tutorial ||
		('socials' in tutorial && tutorial.socials?.youtube)

	return (
		<Card
			className={cn(
				'py-4 h-full overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer flex flex-col',
				tutorial.uid === 'blog-32' && 'border-1 border-primary animate-pulse'
			)}
			onClick={handleCardClick}
		>
			<div className="px-4">
				<AspectRatio
					ratio={16 / 9}
					className="bg-muted rounded-md overflow-hidden"
				>
					{tutorial.cover ? (
						<Image
							src={tutorial.cover}
							alt={tutorial.title}
							fill
							className="object-cover"
						/>
					) : (
						<div className="flex h-full items-center justify-center bg-muted">
							{hasYoutube ? (
								<PlayCircle className="h-10 w-10 text-muted-foreground" />
							) : (
								<BookOpen className="h-10 w-10 text-muted-foreground" />
							)}
						</div>
					)}
				</AspectRatio>
			</div>
			<CardHeader className="text-left px-4 flex-1">
				<div className="flex items-center justify-between">
					<CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="rounded-full h-8 w-8 cursor-pointer"
								onClick={(e) => e.stopPropagation()}
							>
								<ListCollapse className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							{'socials' in tutorial && tutorial.socials?.medium && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										if (tutorial.socials && tutorial.socials.medium) {
											window.open(
												tutorial.socials.medium,
												'_blank',
												'noopener,noreferrer'
											)
										}
									}}
								>
									<PenBox className="mr-2 h-4 w-4" /> Read on Medium
								</DropdownMenuItem>
							)}
							{'socials' in tutorial && tutorial.socials?.github && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										if (tutorial.socials && tutorial.socials.github) {
											window.open(
												tutorial.socials.github,
												'_blank',
												'noopener,noreferrer'
											)
										}
									}}
								>
									<Github className="mr-2 h-4 w-4" /> Fork on GitHub
								</DropdownMenuItem>
							)}
							{hasYoutube && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										const url =
											'youtubeUrl' in tutorial
												? tutorial.youtubeUrl
												: 'socials' in tutorial &&
													tutorial.socials &&
													tutorial.socials.youtube
										if (url) window.open(url, '_blank', 'noopener,noreferrer')
									}}
								>
									<PlayCircle className="mr-2 h-4 w-4" />{' '}
									{'youtubeUrl' in tutorial
										? 'Watch on YouTube'
										: 'Watch on YouTube'}
								</DropdownMenuItem>
							)}
							{'socials' in tutorial && tutorial.socials?.dev && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										if (tutorial.socials && tutorial.socials.dev) {
											window.open(
												tutorial.socials.dev,
												'_blank',
												'noopener,noreferrer'
											)
										}
									}}
								>
									<BookOpen className="mr-2 h-4 w-4" /> Dev.to tutorial
								</DropdownMenuItem>
							)}
							{'socials' in tutorial && tutorial.socials?.linkedin && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										if (tutorial.socials && tutorial.socials.linkedin) {
											window.open(
												tutorial.socials.linkedin,
												'_blank',
												'noopener,noreferrer'
											)
										}
									}}
								>
									<Linkedin className="mr-2 h-4 w-4" /> LinkedIn post
								</DropdownMenuItem>
							)}
							{'socials' in tutorial && tutorial.socials?.twitter && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										if (tutorial.socials && tutorial.socials.twitter) {
											window.open(
												tutorial.socials.twitter,
												'_blank',
												'noopener,noreferrer'
											)
										}
									}}
								>
									<Twitter className="mr-2 h-4 w-4" /> Tweet this
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CardDescription className="line-clamp-3">
					{tutorial.description}
				</CardDescription>
			</CardHeader>
		</Card>
	)
}

export default function TutorialsPage() {
	const [showAllTabs, setShowAllTabs] = useState(false)

	// Sort tutorials in descending order (newest first)
	const sortedTutorials = [...TUTORIALS].reverse()
	const sortedVideoTutorials = [...VIDEO_TUTORIALS].reverse()

	// Filter tutorials based on social media presence
	const tutorialsWithMedium = sortedTutorials.filter((t) => t.socials?.medium)
	const tutorialsWithGithub = sortedTutorials.filter((t) => t.socials?.github)
	const tutorialsWithYoutube = sortedTutorials.filter((t) => t.socials?.youtube)
	const tutorialsWithDev = sortedTutorials.filter((t) => t.socials?.dev)
	const tutorialsWithLinkedin = sortedTutorials.filter(
		(t) => t.socials?.linkedin
	)
	const tutorialsWithTwitter = sortedTutorials.filter((t) => t.socials?.twitter)

	return (
		<div className="not-prose">
			<Tabs defaultValue="all" className="w-full mt-4">
				<TabsList className="flex flex-wrap">
					<div className="flex items-center">
						<TabsTrigger value="all" className="cursor-pointer">
							Show all
						</TabsTrigger>
						<Button
							variant="ghost"
							size="icon"
							className={`h-8 w-8 cursor-pointer 
                ${showAllTabs ? 'text-primary' : ''}
              `}
							onClick={() => setShowAllTabs(!showAllTabs)}
						>
							<ChevronRight
								className={`h-4 w-4 transition-transform duration-200 ${showAllTabs ? 'rotate-180' : ''}`}
							/>
						</Button>
					</div>

					{showAllTabs && (
						<>
							<Separator orientation="vertical" className="mx-1" />
							<TabsTrigger value="youtube" className="cursor-pointer">
								YouTube videos
							</TabsTrigger>
							<TabsTrigger value="medium" className="cursor-pointer">
								Medium articles
							</TabsTrigger>
							<TabsTrigger value="dev" className="cursor-pointer">
								Dev tutorials
							</TabsTrigger>
							<TabsTrigger value="github" className="cursor-pointer">
								Source codes
							</TabsTrigger>
							<TabsTrigger value="linkedin" className="cursor-pointer">
								LinkedIn posts
							</TabsTrigger>
							<TabsTrigger value="twitter" className="cursor-pointer">
								X(twitter) posts
							</TabsTrigger>
						</>
					)}
				</TabsList>

				<TabsContent value="all" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{sortedTutorials.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="youtube" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{sortedVideoTutorials.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
						{tutorialsWithYoutube.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="medium" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tutorialsWithMedium.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="github" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tutorialsWithGithub.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="dev" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tutorialsWithDev.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="linkedin" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tutorialsWithLinkedin.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="twitter" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tutorialsWithTwitter.map((tutorial) => (
							<TutorialCard key={tutorial.uid} tutorial={tutorial} />
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
