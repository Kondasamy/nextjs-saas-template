'use client'

import {
	Boxes,
	Command,
	LifeBuoy,
	Send,
	Settings2,
	Shield,
	SquareTerminal,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { EMAIL_URL, EMAIL_URL_LINK, IMAGE_URL, NAME } from '@/lib/constants'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname()

	const data = {
		user: {
			name: NAME,
			email: EMAIL_URL,
			avatar: IMAGE_URL,
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/',
				icon: SquareTerminal,
				isActive: pathname === '/',
			},
			{
				title: 'Features',
				url: '/features',
				icon: Boxes,
				isActive: pathname.startsWith('/features'),
			},
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '/settings/profile',
				icon: Settings2,
				isActive: pathname.startsWith('/settings'),
				items: [
					{
						title: 'Profile',
						url: '/settings/profile',
					},
					{
						title: 'Account',
						url: '/settings/account',
					},
					{
						title: 'Security',
						url: '/settings/security',
					},
					{
						title: 'Team',
						url: '/settings/team',
					},
					{
						title: 'Notifications',
						url: '/settings/notifications',
					},
				],
			},
			{
				title: 'Admin',
				url: '/admin',
				icon: Shield,
				isActive: pathname.startsWith('/admin'),
				items: [
					{
						title: 'Dashboard',
						url: '/admin',
					},
					{
						title: 'Users',
						url: '/admin/users',
					},
					{
						title: 'Audit Logs',
						url: '/admin/audit',
					},
					{
						title: 'Email Templates',
						url: '/admin/emails',
					},
				],
			},
			{
				title: 'Support',
				url: EMAIL_URL_LINK,
				icon: LifeBuoy,
			},
			{
				title: 'Feedback',
				url: EMAIL_URL_LINK,
				icon: Send,
			},
		],
	}

	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="/">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Your SaaS</span>
									<span className="truncate text-xs text-primary/70">
										Enterprise Edition
									</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	)
}
