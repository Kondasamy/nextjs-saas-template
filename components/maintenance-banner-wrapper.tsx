import { getMaintenanceStatus } from '@/lib/maintenance/server'
import { MaintenanceBanner } from './maintenance-banner'

/**
 * Server component that fetches maintenance status and renders banner if enabled
 */
export async function MaintenanceBannerWrapper() {
	const status = await getMaintenanceStatus()

	if (!status.enabled || !status.message) {
		return null
	}

	return <MaintenanceBanner message={status.message} endTime={status.endTime} />
}
