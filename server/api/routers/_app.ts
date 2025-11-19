import { createTRPCRouter } from '../trpc'
import { invitationsRouter } from './invitations'
import { notificationsRouter } from './notifications'
import { permissionsRouter } from './permissions'
import { storageRouter } from './storage'
import { userRouter } from './user'
import { workspaceRouter } from './workspace'

export const appRouter = createTRPCRouter({
	user: userRouter,
	workspace: workspaceRouter,
	permissions: permissionsRouter,
	invitations: invitationsRouter,
	notifications: notificationsRouter,
	storage: storageRouter,
})

export type AppRouter = typeof appRouter
