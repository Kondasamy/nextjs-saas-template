'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ViewTransitionLink } from '@/components/view-transition-link'

export function NavMain({
	items,
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
		isActive?: boolean
		items?: {
			title: string
			url: string
		}[]
	}[]
}) {
	const _pathname = usePathname()

	return (
		<SidebarGroup>
			<SidebarGroupLabel>SaaS feature</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={item.isActive}
							>
								<ViewTransitionLink href={item.url} className="relative">
									<item.icon className={item.isActive ? 'text-primary' : ''} />
									<span>{item.title}</span>
									{item.url.includes('thing') && (
										<Badge
											variant="default"
											className="absolute right-0 top-0 text-xs px-2 py-0.5"
										>
											new
										</Badge>
									)}
								</ViewTransitionLink>
							</SidebarMenuButton>
							{item.items?.length ? (
								<>
									<CollapsibleTrigger asChild>
										<SidebarMenuAction className="data-[state=open]:rotate-90">
											<ChevronRight />
											<span className="sr-only">Toggle</span>
										</SidebarMenuAction>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<ViewTransitionLink href={subItem.url}>
															<span>{subItem.title}</span>
														</ViewTransitionLink>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</>
							) : null}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
