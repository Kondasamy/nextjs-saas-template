'use client'

import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth/client'

export function UserAvatarMenu() {
	const { user } = useAuth()
	const router = useRouter()

	const handleSignOut = async () => {
		await signOut()
		router.push('/login')
	}

	if (!user) {
		return null
	}

	const initials =
		user.name
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase() ??
		user.email?.[0]?.toUpperCase() ??
		'U'

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.image ?? undefined}
							alt={user.name ?? 'User'}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col items-start text-left text-sm">
						<span className="font-medium">{user.name ?? 'User'}</span>
						<span className="text-xs text-muted-foreground">{user.email}</span>
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => router.push('/settings/profile')}>
						<User className="mr-2 h-4 w-4" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push('/settings/account')}>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut className="mr-2 h-4 w-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
