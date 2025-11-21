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
import { Badge } from '@/components/ui/badge'
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
import { CATEGORY_MAP, type Category, FEATURES, Feature } from './data'

// Card that handles navigation but allows button clicks without nesting <a> tags
function FeatureCard({ feature }: { feature: Feature }) {
	const router = useRouter()

	const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Only navigate if the click was directly on the card, not on a button
		if ((e.target as HTMLElement).closest('button')) {
			return
		}
		if (feature.link) {
			router.push(feature.link)
		}
	}

	const handleExternalLink = (url?: string) => {
		if (url) window.open(url, '_blank', 'noopener,noreferrer')
	}

	return (
		<Card
			className={cn(
				'py-4 h-full overflow-hidden transition-colors hover:bg-muted/50 flex flex-col',
				feature.link && 'cursor-pointer'
			)}
			onClick={feature.link ? handleCardClick : undefined}
		>
			<div className="px-4 relative">
				<AspectRatio
					ratio={16 / 9}
					className="bg-muted rounded-md overflow-hidden"
				>
					{feature.cover ? (
						<Image
							src={feature.cover}
							alt={feature.title}
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
				<div className="flex items-start justify-between gap-2 mb-2">
					<CardTitle className="line-clamp-2 flex-1">{feature.title}</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="rounded-full h-8 w-8 cursor-pointer flex-shrink-0"
								onClick={(e) => e.stopPropagation()}
							>
								<ListCollapse className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							{feature.url && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(feature.url)
									}}
								>
									<ExternalLink className="mr-2 h-4 w-4" /> Visit website
								</DropdownMenuItem>
							)}
							{feature.youtube && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(feature.youtube)
									}}
								>
									<PlayCircle className="mr-2 h-4 w-4" /> Watch on YouTube
								</DropdownMenuItem>
							)}
							{feature.github && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										handleExternalLink(feature.github)
									}}
								>
									<Github className="mr-2 h-4 w-4" /> View on GitHub
								</DropdownMenuItem>
							)}
							{feature.tutorial && (
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation()
										router.push(feature.tutorial!)
									}}
								>
									<BookOpen className="mr-2 h-4 w-4" /> Read tutorial
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CardDescription className="line-clamp-3 mb-3">
					{feature.description}
				</CardDescription>
				{feature.tags && feature.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mt-2">
						{feature.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				)}
			</CardHeader>
		</Card>
	)
}

export default function FeaturesPage() {
	const [showAllTabs, setShowAllTabs] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null
	)

	// Sort features
	const sortedFeatures = [...FEATURES]

	// Filter by category
	const coreFeatures = sortedFeatures.filter((f) => f.category === 'core')
	const authFeatures = sortedFeatures.filter((f) => f.category === 'auth')
	const workspaceFeatures = sortedFeatures.filter(
		(f) => f.category === 'workspace'
	)
	const communicationFeatures = sortedFeatures.filter(
		(f) => f.category === 'communication'
	)
	const storageFeatures = sortedFeatures.filter((f) => f.category === 'storage')
	const analyticsFeatures = sortedFeatures.filter(
		(f) => f.category === 'analytics'
	)
	const uiFeatures = sortedFeatures.filter((f) => f.category === 'ui')
	const productionFeatures = sortedFeatures.filter(
		(f) => f.category === 'production'
	)

	// Filter features based on selected category
	const getFilteredFeatures = (baseFeatures: Feature[]) => {
		if (!selectedCategory || selectedCategory === 'all') return baseFeatures

		return baseFeatures.filter(
			(feature) => feature.category === selectedCategory
		)
	}

	const categoryOptions: { value: Category; label: string }[] = [
		{ value: 'all', label: 'All Features' },
		{ value: 'core', label: 'Core Infrastructure' },
		{ value: 'auth', label: 'Authentication & Security' },
		{ value: 'workspace', label: 'Workspace & RBAC' },
		{ value: 'communication', label: 'Communication' },
		{ value: 'storage', label: 'Storage & Files' },
		{ value: 'analytics', label: 'Analytics & Admin' },
		{ value: 'ui', label: 'UI & Developer Experience' },
		{ value: 'production', label: 'Production Ready' },
	]

	return (
		<div className="not-prose">
			<Tabs defaultValue="all" className="w-full mt-4">
				<div className="flex justify-between items-center mb-4 flex-wrap gap-4">
					<TabsList className="flex flex-wrap">
						<div className="flex justify-between items-center">
							<TabsTrigger value="all" className="cursor-pointer">
								Show all
							</TabsTrigger>
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									'h-8 w-8 cursor-pointer',
									showAllTabs && 'text-primary'
								)}
								onClick={() => setShowAllTabs(!showAllTabs)}
							>
								<ChevronRight
									className={cn(
										'h-4 w-4 transition-transform duration-200',
										showAllTabs && 'rotate-180'
									)}
								/>
							</Button>
						</div>

						{showAllTabs && (
							<>
								<Separator orientation="vertical" className="mx-1" />
								<TabsTrigger value="core" className="cursor-pointer">
									Core
								</TabsTrigger>
								<TabsTrigger value="auth" className="cursor-pointer">
									Auth
								</TabsTrigger>
								<TabsTrigger value="workspace" className="cursor-pointer">
									Workspace
								</TabsTrigger>
								<TabsTrigger value="communication" className="cursor-pointer">
									Communication
								</TabsTrigger>
								<TabsTrigger value="storage" className="cursor-pointer">
									Storage
								</TabsTrigger>
								<TabsTrigger value="analytics" className="cursor-pointer">
									Analytics
								</TabsTrigger>
								<TabsTrigger value="ui" className="cursor-pointer">
									UI
								</TabsTrigger>
								<TabsTrigger value="production" className="cursor-pointer">
									Production
								</TabsTrigger>
							</>
						)}
					</TabsList>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<ListFilter className="h-4 w-4" />
								{selectedCategory
									? CATEGORY_MAP[selectedCategory]
									: 'Filter by Category'}
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{categoryOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									className="cursor-pointer"
									onClick={() => {
										setSelectedCategory(option.value)
										toast.success(`Filtered by ${option.label}`)
									}}
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<TabsContent value="all" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(sortedFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="core" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(coreFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="auth" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(authFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="workspace" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(workspaceFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="communication" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(communicationFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="storage" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(storageFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="analytics" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(analyticsFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="ui" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(uiFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>

				<TabsContent value="production" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{getFilteredFeatures(productionFeatures).map((feature) => (
							<FeatureCard key={feature.uid} feature={feature} />
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
