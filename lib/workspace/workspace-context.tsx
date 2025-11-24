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
	refetchWorkspaces: () => void
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
	const [isCreatingDefault, setIsCreatingDefault] = useState(false)

	// Fetch all workspaces with caching strategy
	const {
		data: workspaces = [],
		isLoading: isLoadingWorkspaces,
		refetch: refetchWorkspaces,
	} = trpc.workspace.list.useQuery(undefined, {
		// Cache workspaces for 5 minutes
		staleTime: 5 * 60 * 1000,
		// Keep cached data for 10 minutes
		gcTime: 10 * 60 * 1000,
		// Only fetch when component is mounted and initialized
		enabled: true,
		// Prevent refetch on window focus (workspaces don't change that often)
		refetchOnWindowFocus: false,
		// Keep previous data while fetching new data
		placeholderData: (prev) => prev,
	})

	const ensureDefaultWorkspace = trpc.workspace.ensureDefault.useMutation({
		onSuccess: async () => {
			// Refetch workspaces after creating default
			await refetchWorkspaces()
			// Don't clear isCreatingDefault here - let the useEffect handle it
			// when workspaces are loaded to avoid race conditions
		},
		onError: () => {
			// On error, clear the creating state and mark as initialized
			// to prevent infinite loading
			setIsCreatingDefault(false)
			setIsInitialized(true)
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
				setIsCreatingDefault(false) // Clear creating state

				// Update localStorage if we're using the first workspace
				if (typeof window !== 'undefined' && !storedWorkspace) {
					localStorage.setItem(WORKSPACE_STORAGE_KEY, initialWorkspace.id)
				}
			} else if (!isCreatingDefault) {
				// No workspaces and not already creating - try to create default workspace
				setIsCreatingDefault(true)
				ensureDefaultWorkspace.mutate()
				// Don't mark as initialized yet - wait for workspace creation
			}
		}
	}, [
		workspaces,
		isLoadingWorkspaces,
		isInitialized,
		isCreatingDefault,
		// Remove mutation and refetch functions from deps - they're stable
		// eslint-disable-next-line react-hooks/exhaustive-deps
	])

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
		refetchWorkspaces: () => void refetchWorkspaces(),
		isLoading: isLoadingWorkspaces || !isInitialized || isCreatingDefault,
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
