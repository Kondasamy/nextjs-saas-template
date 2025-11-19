import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	BINANCE_ADDRESS,
	BITCOIN_ADDRESS,
	ETHEREUM_ADDRESS,
	SOLANA_ADDRESS,
	TETHER_ADDRESS,
} from '@/lib/constants'
import { Button } from './ui/button'

export default function DonationDialog({
	children,
}: {
	children: React.ReactNode
}) {
	const addresses = [
		{ label: 'SOLANA', value: SOLANA_ADDRESS },
		{ label: 'BITCOIN', value: BITCOIN_ADDRESS },
		{ label: 'ETHEREUM', value: ETHEREUM_ADDRESS },
		{ label: 'TETHER', value: TETHER_ADDRESS },
		{ label: 'BINANCE', value: BINANCE_ADDRESS },
	]

	const handleCopy = (addr: string) => {
		navigator.clipboard.writeText(addr)
		toast.success('Copied to clipboard')
	}

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="min-w-xl">
				<DialogHeader>
					<DialogTitle>Donation Addresses</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					All the donations are highly appreciated!
				</DialogDescription>
				<div className="flex flex-col gap-2">
					{addresses.map((item) => (
						<div
							key={item.label}
							className="flex flex-col gap-2 items-start w-full"
						>
							<span className="font-medium text-sm">{item.label}</span>
							<div className="flex items-center gap-1 w-full">
								<div
									key={item.label}
									className="flex items-center justify-between bg-zinc-900 rounded-lg p-2 w-full"
								>
									<div className="flex flex-col">
										<code className="text-sm text-zinc-400 break-all">
											{item.value}
										</code>
									</div>
								</div>
								<Button
									variant="outline"
									size="icon"
									className="flex items-center gap-1"
									onClick={() => handleCopy(item.value)}
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
