import { type LucideIcon } from 'lucide-react'
import * as React from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useMediaQuery } from '../hooks/use-media-query'

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
	}[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const [open, setOpen] = React.useState(false)
	const [activeItem, setActiveItem] = React.useState<(typeof items)[0] | null>(
		null
	)
	const [mounted, setMounted] = React.useState(false)
	const isDesktop = useMediaQuery('(min-width: 768px)')

	React.useEffect(() => {
		setMounted(true)
	}, [])

	const handleItemClick = (item: (typeof items)[0]) => {
		if (item.title === 'Book a Call') {
			setActiveItem(item)
			setOpen(true)
			return
		}
	}

	const CalendarContent = () => (
		<>
			<div className="w-full">
				{activeItem && (
					<iframe
						src={activeItem.url}
						frameBorder="0"
						className="w-full h-[80vh]"
						title="Book a Call"
					/>
				)}
			</div>
		</>
	)

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							{item.title === 'Book a Call' && mounted ? (
								isDesktop ? (
									<Dialog open={open} onOpenChange={setOpen}>
										<DialogTrigger asChild>
											<SidebarMenuButton
												asChild
												size="sm"
												onClick={() => handleItemClick(item)}
											>
												<button>
													<item.icon />
													<span>{item.title}</span>
												</button>
											</SidebarMenuButton>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[80vw] lg:max-w-[80vw]">
											<DialogHeader>
												<DialogTitle>Book a Call</DialogTitle>
											</DialogHeader>
											<CalendarContent />
										</DialogContent>
									</Dialog>
								) : (
									<Drawer open={open} onOpenChange={setOpen}>
										<DrawerTrigger asChild>
											<SidebarMenuButton
												asChild
												size="sm"
												onClick={() => handleItemClick(item)}
											>
												<button>
													<item.icon />
													<span>{item.title}</span>
												</button>
											</SidebarMenuButton>
										</DrawerTrigger>
										<DrawerContent>
											<DrawerHeader>
												<DrawerTitle className="text-center">
													Book a Call
												</DrawerTitle>
											</DrawerHeader>
											<div className="px-4 pb-4">
												<CalendarContent />
											</div>
										</DrawerContent>
									</Drawer>
								)
							) : (
								<SidebarMenuButton asChild size="sm">
									<a href={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
