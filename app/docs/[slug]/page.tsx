// this is a default page when user types incorrect application slug.
// we simply show it's locked and pro.

import { Lock, SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Page() {
	return (
		<>
			<div className="absolute inset-0 backdrop-blur-lg bg-background/60 flex flex-col items-center justify-center z-10 rounded-lg">
				<div className="flex flex-col items-center gap-6 max-w-md text-center p-6">
					<div className="bg-primary/10 p-3 rounded-full">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<h2 className="text-2xl font-bold">Probably Enterprise... idk yet</h2>
					<p className="text-muted-foreground">
						Unlock access to crazy experiments about nerdy web stuff I guess
					</p>
					<Button asChild size="lg" className="gap-2">
						<a href="#" target="_blank" rel="noopener noreferrer">
							<SparklesIcon className="h-4 w-4" />
							Upgrade to Pro
						</a>
					</Button>
				</div>
			</div>
		</>
	)
}
