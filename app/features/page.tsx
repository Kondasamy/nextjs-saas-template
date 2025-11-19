'use client'

import {
	BookOpen,
	Boxes,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Github,
	ListCollapse,
	ListFilter,
	PlayCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { THINGS, Thing } from './data'

// Card that handles navigation but allows button clicks without nesting <a> tags
function ThingCard({ thing }: { thing: Thing }) {
	const router = useRouter()
	const [showPrize, setShowPrize] = useState(false)

	const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Only navigate if the click was directly on the card, not on a button
		if ((e.target as HTMLElement).closest('button')) {
			return
		}
		router.push(thing.link)
	}

	const handleExternalLink = (url?: string) => {
		if (url) window.open(url, '_blank', 'noopener,noreferrer')
	}

	// Toggle between badge status and prize amount
	const _togglePrize = (e: React.MouseEvent) => {
		e.stopPropagation()
		setShowPrize(!showPrize)
	}

	// Get badge variant based on hackathon status
	const _getBadgeVariant = (status: string) => {
		switch (status) {
			case 'winner':
				return 'destructive'
			case 'finalist':
				return 'secondary'
			case 'honorable-mention':
				return 'outline'
			case 'in-progress':
				return 'default'
			case 'loser':
				return 'outline'
			default:
				return 'outline'
		}
	}

	return (
		<Card
			className={cn(
				'py-4 h-full overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer flex flex-col',
				thing.uid === 'thing--6' && 'border-1 border-primary animate-pulse'
			)}
			onClick={handleCardClick}
		>
			<div className="px-4 relative">
				<AspectRatio
					ratio={16 / 9}
					className="bg-muted rounded-md overflow-hidden"
				>
					{thing.cover ? (
						<Image
							src={thing.cover}
							alt={thing.title}
							fill
							className="object-cover"
						/>
					) : (
						<div className="flex h-full items-center justify-center bg-muted">
							<Boxes className="h-10 w-10 text-muted-foreground" />
						</div>
					)}
				</AspectRatio>
			</div>

			<CardHeader className="text-left px-4 flex-1">
				<div className="flex items-center justify-between">
					<CardTitle className="line-clamp-2">{thing.title}</CardTitle>
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
							{thing.url && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(thing.url)
									}}
								>
									<ExternalLink className="mr-2 h-4 w-4" /> Visit website
								</DropdownMenuItem>
							)}
							{thing.youtube && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(thing.youtube)
									}}
								>
									<PlayCircle className="mr-2 h-4 w-4" /> Watch on YouTube
								</DropdownMenuItem>
							)}
							{thing.github && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(thing.github)
									}}
								>
									<Github className="mr-2 h-4 w-4" /> Fork on GitHub
								</DropdownMenuItem>
							)}
							{thing.tutorial && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										router.push(thing.tutorial!)
									}}
								>
									<BookOpen className="mr-2 h-4 w-4" /> Read tutorial
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CardDescription className="line-clamp-3">
					{thing.description}
				</CardDescription>
			</CardHeader>
		</Card>
	)
}

export default function ThingsPage() {
	const [showAllTabs, setShowAllTabs] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

	// Sort things in ascending order (newest first)
	const sortedThings = [...THINGS]
	const youtubeThings = sortedThings.filter((thing) => thing.youtube)
	const tutorialThings = sortedThings.filter((thing) => thing.tutorial)
	const githubThings = sortedThings.filter((thing) => thing.github)

	// Hackathon filtering
	const hackathonThings = sortedThings.filter((thing) => thing.hackathon)
	const _hackathonWinners = sortedThings.filter(
		(thing) => thing.hackathon?.winner === 'winner'
	)
	const _hackathonFinalists = sortedThings.filter(
		(thing) => thing.hackathon?.winner === 'finalist'
	)
	const _hackathonHonorableMentions = sortedThings.filter(
		(thing) => thing.hackathon?.winner === 'honorable-mention'
	)
	const _hackathonInProgress = sortedThings.filter(
		(thing) => thing.hackathon?.winner === 'in-progress'
	)
	const _hackathonLosers = sortedThings.filter(
		(thing) => thing.hackathon?.winner === 'loser'
	)

	// Get all hackathon statuses for filtering
	const hackathonCategories = [
		'All Hackathons',
		'Winners',
		'Finalists',
		'Honorable Mentions',
		'In Progress',
		'Losers',
	]

	// Filter things based on selected category
	const getFilteredThings = (baseThings: Thing[]) => {
		if (!selectedCategory) return baseThings

		switch (selectedCategory) {
			case 'All Hackathons':
				return baseThings.filter((thing) => thing.hackathon)
			case 'Winners':
				return baseThings.filter(
					(thing) => thing.hackathon?.winner === 'winner'
				)
			case 'Finalists':
				return baseThings.filter(
					(thing) => thing.hackathon?.winner === 'finalist'
				)
			case 'Honorable Mentions':
				return baseThings.filter(
					(thing) => thing.hackathon?.winner === 'honorable-mention'
				)
			case 'In Progress':
				return baseThings.filter(
					(thing) => thing.hackathon?.winner === 'in-progress'
				)
			case 'Losers':
				return baseThings.filter((thing) => thing.hackathon?.winner === 'loser')
			default:
				return baseThings
		}
	}

	return (
		<div className="not-prose">
			<Tabs defaultValue="all" className="w-full mt-4">
				<div className="flex justify-between items-center mb-4">
					<TabsList className="flex flex-wrap">
						<div className="flex justify-between items-center">
							<TabsTrigger value="all" className="cursor-pointer">
								Show all
							</TabsTrigger>
							<Button
								variant="ghost"
								size="icon"
								className={`h-8 w-8 cursor-pointer ${showAllTabs ? 'text-primary' : ''}`}
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
								<TabsTrigger value="videos" className="cursor-pointer">
									YouTube videos
								</TabsTrigger>
								<TabsTrigger value="tutorials" className="cursor-pointer">
									Written tutorials
								</TabsTrigger>
								<TabsTrigger value="github" className="cursor-pointer">
									Source codes
								</TabsTrigger>
								<TabsTrigger value="hackathon" className="cursor-pointer">
									Hackathons
								</TabsTrigger>
							</>
						)}
					</TabsList>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<ListFilter className="h-4 w-4" />
								{selectedCategory || 'Filter by Hackathon'}
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									setSelectedCategory(null)
									toast.success('Showing all projects')
								}}
							>
								All Projects
							</DropdownMenuItem>
							{hackathonCategories.map((category) => (
								<DropdownMenuItem
									key={category}
									className="cursor-pointer"
									onClick={() => {
										setSelectedCategory(category)
										toast.success(`Filtered by ${category}`)
									}}
								>
									{category}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<TabsContent value="all" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredThings(sortedThings).map((thing) => (
							<ThingCard key={thing.uid} thing={thing} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="videos" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredThings(youtubeThings).map((thing) => (
							<ThingCard key={thing.uid} thing={thing} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="tutorials" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredThings(tutorialThings).map((thing) => (
							<ThingCard key={thing.uid} thing={thing} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="github" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredThings(githubThings).map((thing) => (
							<ThingCard key={thing.uid} thing={thing} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="hackathon" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredThings(hackathonThings).map((thing) => (
							<ThingCard key={thing.uid} thing={thing} />
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
