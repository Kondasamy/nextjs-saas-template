'use client'

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import { trpc } from '@/lib/trpc/client'

interface Organization {
	id: string
	name: string
	slug: string
	description: string | null
	logo: string | null
	role: {
		id: string
		name: string
		permissions: string[]
	}
	joinedAt: Date
}

interface WorkspaceContextType {
	currentWorkspace: Organization | null
	workspaces: Organization[]
	switchWorkspace: (id: string) => void
	isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined
)

const WORKSPACE_STORAGE_KEY = 'current-workspace-id'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
		null
	)
	const [isInitialized, setIsInitialized] = useState(false)

	// Fetch all workspaces
	const { data: workspaces = [], isLoading: isLoadingWorkspaces, refetch: refetchWorkspaces } =
		trpc.workspace.list.useQuery()

	const ensureDefaultWorkspace = trpc.workspace.ensureDefault.useMutation({
		onSuccess: () => {
			// Refetch workspaces after creating default
			void refetchWorkspaces()
		},
	})

	// Initialize workspace from localStorage or first workspace
	useEffect(() => {
		if (!isLoadingWorkspaces && !isInitialized) {
			if (workspaces.length > 0) {
				const storedWorkspaceId =
					typeof window !== 'undefined'
						? localStorage.getItem(WORKSPACE_STORAGE_KEY)
						: null

				// Check if stored workspace exists in user's workspaces
				const storedWorkspace = workspaces.find(
					(w) => w.id === storedWorkspaceId
				)

				// Use stored workspace if valid, otherwise use first workspace
				const initialWorkspace = storedWorkspace || workspaces[0]
				setCurrentWorkspaceId(initialWorkspace.id)
				setIsInitialized(true)

				// Update localStorage if we're using the first workspace
				if (typeof window !== 'undefined' && !storedWorkspace) {
					localStorage.setItem(WORKSPACE_STORAGE_KEY, initialWorkspace.id)
				}
			} else {
				// No workspaces - try to create default workspace
				void ensureDefaultWorkspace.mutate()
				// Mark as initialized so loading state resolves
				setIsInitialized(true)
			}
		}
	}, [workspaces, isLoadingWorkspaces, isInitialized, ensureDefaultWorkspace, refetchWorkspaces])

	// Ensure current workspace is still valid when workspaces list changes
	useEffect(() => {
		if (
			isInitialized &&
			currentWorkspaceId &&
			workspaces.length > 0 &&
			!workspaces.find((w) => w.id === currentWorkspaceId)
		) {
			// Current workspace no longer exists, switch to first available
			const firstWorkspace = workspaces[0]
			setCurrentWorkspaceId(firstWorkspace.id)
			if (typeof window !== 'undefined') {
				localStorage.setItem(WORKSPACE_STORAGE_KEY, firstWorkspace.id)
			}
		}
	}, [workspaces, currentWorkspaceId, isInitialized])

	// Switch workspace function
	const switchWorkspace = (id: string) => {
		const workspace = workspaces.find((w) => w.id === id)
		if (workspace) {
			setCurrentWorkspaceId(id)
			if (typeof window !== 'undefined') {
				localStorage.setItem(WORKSPACE_STORAGE_KEY, id)
			}
		}
	}

	// Get current workspace object
	const currentWorkspace =
		workspaces.find((w) => w.id === currentWorkspaceId) || null

	const value: WorkspaceContextType = {
		currentWorkspace,
		workspaces,
		switchWorkspace,
		isLoading: isLoadingWorkspaces || !isInitialized,
	}

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	)
}

export function useWorkspace() {
	const context = useContext(WorkspaceContext)
	if (context === undefined) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider')
	}
	return context
}
