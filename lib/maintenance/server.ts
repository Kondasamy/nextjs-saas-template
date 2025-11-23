/**
 * Server-side maintenance mode utilities
 * These functions run on the server and interact with the database
 */

import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export interface MaintenanceStatus {
	enabled: boolean
	message: string | null
	startedAt: Date | null
	endTime: Date | null
}

/**
 * Get the current maintenance mode status from the database
 */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
	try {
		const settings = await prisma.systemSettings.findUnique({
			where: { id: 'system' },
			select: {
				maintenanceMode: true,
				maintenanceMessage: true,
				maintenanceStartedAt: true,
				maintenanceEndTime: true,
			},
		})

		return {
			enabled: settings?.maintenanceMode ?? false,
			message: settings?.maintenanceMessage ?? null,
			startedAt: settings?.maintenanceStartedAt ?? null,
			endTime: settings?.maintenanceEndTime ?? null,
		}
	} catch (error) {
		logger.error('Error fetching maintenance status', error)
		return {
			enabled: false,
			message: null,
			startedAt: null,
			endTime: null,
		}
	}
}

/**
 * Enable maintenance mode with an optional message and end time
 */
export async function enableMaintenanceMode(
	message?: string,
	endTime?: Date,
	updatedBy?: string
): Promise<void> {
	await prisma.systemSettings.upsert({
		where: { id: 'system' },
		update: {
			maintenanceMode: true,
			maintenanceMessage: message || 'We are currently performing maintenance.',
			maintenanceStartedAt: new Date(),
			maintenanceEndTime: endTime,
			updatedBy,
		},
		create: {
			id: 'system',
			maintenanceMode: true,
			maintenanceMessage: message || 'We are currently performing maintenance.',
			maintenanceStartedAt: new Date(),
			maintenanceEndTime: endTime,
			updatedBy,
		},
	})
}

/**
 * Disable maintenance mode
 */
export async function disableMaintenanceMode(
	updatedBy?: string
): Promise<void> {
	await prisma.systemSettings.upsert({
		where: { id: 'system' },
		update: {
			maintenanceMode: false,
			maintenanceMessage: null,
			maintenanceStartedAt: null,
			maintenanceEndTime: null,
			updatedBy,
		},
		create: {
			id: 'system',
			maintenanceMode: false,
			updatedBy,
		},
	})
}
