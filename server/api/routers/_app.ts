import { createTRPCRouter } from '../trpc'
import { userRouter } from './user'
import { workspaceRouter } from './workspace'
import { permissionsRouter } from './permissions'
import { invitationsRouter } from './invitations'
import { notificationsRouter } from './notifications'
import { storageRouter } from './storage'

export const appRouter = createTRPCRouter({
	user: userRouter,
	workspace: workspaceRouter,
	permissions: permissionsRouter,
	invitations: invitationsRouter,
	notifications: notificationsRouter,
	storage: storageRouter,
})

export type AppRouter = typeof appRouter

