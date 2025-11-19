'use client'

import {
	ArrowLeft,
	BookOpen,
	Boxes,
	ChevronDown,
	Copy,
	ExternalLink,
	Github,
	PlayCircle,
	Share2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

function ShareDropdown({
	thing,
	onCopy,
}: {
	thing: Thing
	onCopy: () => void
}) {
	const _currentUrl = typeof window !== 'undefined' ? window.location.href : ''

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-1 cursor-pointer"
				>
					<Share2 className="h-4 w-4" />
					<span>Share</span>
					<ChevronDown className="h-3 w-3 ml-1" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem className="cursor-pointer" onClick={onCopy}>
					<Copy className="mr-2 h-4 w-4" />
					<span>Copy URL</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{thing.url && (
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => handleExternalLink(thing.url)}
					>
						<ExternalLink className="mr-2 h-4 w-4" />
						<span>Visit Website</span>
					</DropdownMenuItem>
				)}

				{thing.github && (
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => handleExternalLink(thing.github)}
					>
						<Github className="mr-2 h-4 w-4" />
						<span>GitHub Repository</span>
					</DropdownMenuItem>
				)}

				{thing.youtube && (
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => handleExternalLink(thing.youtube)}
					>
						<PlayCircle className="mr-2 h-4 w-4" />
						<span>YouTube Video</span>
					</DropdownMenuItem>
				)}

				{thing.tutorial && (
					<DropdownMenuItem asChild>
						<Link href={thing.tutorial} className="flex items-center">
							<BookOpen className="mr-2 h-4 w-4" />
							<span>View Tutorial</span>
						</Link>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// Handle button clicks for external links
const handleExternalLink = (url?: string) => {
	if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

// Define the Thing type to match your data structure
interface Thing {
	uid: string
	title: string
	description: string
	cover?: string
	link: string
	url?: string
	github?: string
	youtube?: string
	tutorial?: string
}

interface ThingClientProps {
	thing: Thing
}

export default function ThingClient({ thing }: ThingClientProps) {
	// Determine if we should show the iframe
	const showIframe = thing.url && thing.url.trim() !== ''
	const [_isCopied, setIsCopied] = useState(false)

	const handleCopy = () => {
		const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
		navigator.clipboard.writeText(currentUrl)
		setIsCopied(true)
		setTimeout(() => setIsCopied(false), 2000)
	}

	return (
		<>
			<div className="not-prose mb-8">
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-start">
						<h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
							{thing.title}
						</h1>
						<ShareDropdown thing={thing} onCopy={handleCopy} />
					</div>
					<p className="text-xl text-muted-foreground">{thing.description}</p>

					{!showIframe && thing.cover && (
						<div className="mt-4 mb-6">
							<AspectRatio
								ratio={16 / 9}
								className="bg-muted rounded-lg overflow-hidden"
							>
								<Image
									src={thing.cover}
									alt={thing.title}
									fill
									className="object-cover"
								/>
							</AspectRatio>
						</div>
					)}
				</div>

				<Separator className="my-6" />
			</div>

			{/* Embed the external website using an iframe if URL exists */}
			{showIframe ? (
				<div className="w-full h-screen rounded-lg overflow-hidden border">
					<iframe
						src={thing.url}
						className="w-full h-full"
						title={thing.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</div>
			) : (
				<div className="w-full h-full flex items-center justify-center p-12 border rounded-lg bg-muted">
					<div className="text-center text-muted-foreground">
						<Boxes className="w-12 h-12 mx-auto mb-4" />
						<p>No website available for this project</p>
						<Link href="/thing">
							<Button
								variant="default"
								size="sm"
								className="mt-4 cursor-pointer"
							>
								<ArrowLeft className="mr-1 h-3 w-3" /> Back
							</Button>
						</Link>
					</div>
				</div>
			)}
		</>
	)
}
