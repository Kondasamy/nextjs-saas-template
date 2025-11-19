import { ExternalLink, Github, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { THINGS } from './features/data'

// Featured items for homepage
const FEATURED_ITEMS = THINGS.slice(0, 3)

// Define card shapes and directions statically to avoid recalculations
const rotations = [-2, 1, -1]
const badgeRotations = [3, -2, 4]
const _blurDirections = ['bottom', 'right', 'left'] as const

export default function HomePage() {
	return (
		<div className="relative w-full min-h-screen pb-20">
			{/* Background with subtle gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80 z-0" />

			<div className="relative z-10 container mx-auto px-4 py-16">
				<h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
					Welcome to Your SaaS
				</h1>
				<p className="text-xl text-muted-foreground mb-8 max-w-3xl">
					Build, deploy, and scale your applications with our powerful platform.
					Get started with our featured tools and integrations below.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
					{FEATURED_ITEMS.map((thing, index) => (
						<div
							key={thing.uid}
							className="rounded-2xl overflow-hidden transform"
							style={{
								transform: `rotate(${rotations[index % 3]}deg)`,
								zIndex: 10 - index,
							}}
						>
							<div className="relative aspect-[4/5] w-full group">
								{/* Image with optimized loading */}
								<div className="absolute inset-0 w-full h-full bg-muted/30">
									<Image
										src={thing.cover}
										alt={thing.title}
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover object-right-bottom will-change-transform"
										loading="lazy"
										placeholder="blur"
										blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQILOl9LqwAAAABJRU5ErkJggg=="
									/>
								</div>

								{/* Simpler blur overlay with reduced computational cost */}
								<div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black/70 to-transparent backdrop-blur-xs" />

								{/* Content overlay */}
								<div className="absolute inset-0 flex flex-col justify-end p-6">
									{/* Badge */}
									<div
										className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-medium bg-black/30 text-white/90"
										style={{
											transform: `rotate(${badgeRotations[index % 3]}deg)`,
										}}
									>
										Featured
									</div>

									{/* Title and description */}
									<div className="mb-6 translate-z-0">
										<h3 className="text-2xl font-bold text-white mb-2">
											{thing.title}
										</h3>
										<p className="text-white/80 line-clamp-2">
											{thing.description}
										</p>
									</div>

									{/* Action buttons */}
									<div className="flex justify-between items-center">
										<div className="flex gap-2">
											{thing.github && (
												<Button
													size="icon"
													variant="secondary"
													className="bg-black/30 hover:bg-black/50 text-white"
													asChild
												>
													<a
														href={thing.github}
														target="_blank"
														rel="noopener noreferrer"
													>
														<Github className="h-4 w-4" />
													</a>
												</Button>
											)}

											{thing.youtube && (
												<Button
													size="icon"
													variant="secondary"
													className="bg-black/30 hover:bg-black/50 text-white"
													asChild
												>
													<a
														href={thing.youtube}
														target="_blank"
														rel="noopener noreferrer"
													>
														<Play className="h-4 w-4" />
													</a>
												</Button>
											)}

											{thing.url && (
												<Button
													size="icon"
													variant="secondary"
													className="bg-black/30 hover:bg-black/50 text-white"
													asChild
												>
													<a
														href={thing.url}
														target="_blank"
														rel="noopener noreferrer"
													>
														<ExternalLink className="h-4 w-4" />
													</a>
												</Button>
											)}
										</div>

										<Button
											className="bg-black/30 hover:bg-black/50 text-white"
											asChild
										>
											<Link href={thing.link}>Explore</Link>
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
