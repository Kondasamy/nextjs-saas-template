import { TeamSettingsContent } from '@/components/settings/team-settings-content'
import { requireAuth } from '@/lib/auth/auth-helpers'

export default async function TeamSettingsPage() {
	await requireAuth()

	return <TeamSettingsContent />
}
