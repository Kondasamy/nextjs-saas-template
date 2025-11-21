'use client'

export default function TakeTrashLanding() {
	const environmental_actions = [
		'take out trash',
		'plant trees',
		'water plants',
		'sort recycling',
	]
	const digital_issues = [
		'content overdose',
		'screen addiction',
		'brainrot',
		'digital overload',
		'doomscrolling',
		'mindless scrolling',
	]

	return (
		<main className="flex min-h-screen flex-col md:flex-row">
			{/* Left side - Text content */}
			<div className="flex-1 flex flex-col justify-center p-8 bg-[var(--primary-darkest)] text-[var(--text-light-default)]">
				<div className="max-w-lg mx-auto">
					<h1 className="text-5xl md:text-6xl font-bold mb-6">
						decrease your
						<span className="block mt-2 text-5xl md:text-6xl text-green-400">
							screen time...
						</span>
						<span className="block mt-2 text-5xl md:text-6xl text-green-500">
							take trash
						</span>
					</h1>

					<div className="mt-8 mb-4">
						<h2 className="text-xl font-semibold mb-3">
							Replace digital addiction with environmental action
						</h2>
						<div className="flex flex-wrap gap-2 mt-4">
							{digital_issues.map((issue, index) => (
								<span
									key={index}
									className="px-3 py-1 rounded-full bg-red-500/20 text-red-800 text-sm"
								>
									{issue}
								</span>
							))}
						</div>

						<div className="flex flex-wrap gap-2 mt-4">
							{environmental_actions.map((action, index) => (
								<span
									key={index}
									className="px-3 py-1 rounded-full bg-green-500/20 text-green-800 text-sm"
								>
									{action}
								</span>
							))}
						</div>
					</div>

					<div className="mt-10">
						<a
							href="https://forms.gle/PGv3SJGmsS2p5s1XA"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block px-8 py-3 rounded-lg font-medium text-white text-lg bg-green-500 hover:bg-green-600 transition-all duration-200 shadow-lg"
						>
							Join Waitlist
						</a>
					</div>
				</div>
			</div>

			{/* Right side - Video content */}
			<div className="flex items-center justify-center p-8 bg-[var(--primary-darkest)]">
				<div className="w-full max-w-lg h-[600px] aspect-video rounded-xl overflow-hidden shadow-lg">
					<div className="w-full h-full flex items-center justify-center bg-[var(--primary-darkest)] text-[var(--text-light-secondary)] rounded-xl">
						<video
							src="/videos/dotenv-live-demo.mp4"
							autoPlay
							muted={false}
							loop
							controls
							className="w-full h-full object-contain rounded-xl"
						/>
					</div>
				</div>
			</div>
		</main>
	)
}
