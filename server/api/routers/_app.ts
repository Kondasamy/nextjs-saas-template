import { createTRPCRouter } from '../trpc'
import { adminRouter } from './admin'
import { analyticsRouter } from './analytics'
import { invitationsRouter } from './invitations'
import { notificationsRouter } from './notifications'
import { permissionsRouter } from './permissions'
import { storageRouter } from './storage'
import { themeRouter } from './theme'
import { userRouter } from './user'
import { workspaceRouter } from './workspace'

export const appRouter = createTRPCRouter({
	user: userRouter,
	workspace: workspaceRouter,
	permissions: permissionsRouter,
	invitations: invitationsRouter,
	notifications: notificationsRouter,
	storage: storageRouter,
	analytics: analyticsRouter,
	admin: adminRouter,
	theme: themeRouter,
})

export type AppRouter = typeof appRouter
