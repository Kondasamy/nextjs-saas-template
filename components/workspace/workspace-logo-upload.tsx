'use client'

import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/workspace/workspace-context'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]

export function WorkspaceLogoUpload() {
	const { currentWorkspace, refetchWorkspaces } = useWorkspace()
	const [isUploading, setIsUploading] = useState(false)
	const [preview, setPreview] = useState<string | null>(null)

	const updateWorkspace = trpc.workspace.update.useMutation({
		onSuccess: () => {
			toast.success('Workspace logo updated successfully')
			setPreview(null)
			refetchWorkspaces()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to update workspace logo')
		},
	})

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			if (!file) return

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				toast.error('File size must be less than 5MB')
				return
			}

			// Validate file type
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				toast.error(
					'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image'
				)
				return
			}

			setIsUploading(true)

			try {
				// Convert file to base64 for simple upload
				const reader = new FileReader()
				reader.onloadend = async () => {
					const base64 = reader.result as string

					// For now, we'll use a simple data URL
					// In production, you'd upload to a CDN/storage service
					setPreview(base64)

					// Update workspace with the data URL
					if (currentWorkspace) {
						await updateWorkspace.mutateAsync({
							id: currentWorkspace.id,
							logo: base64,
						})
					}

					setIsUploading(false)
				}
				reader.onerror = () => {
					toast.error('Failed to read file')
					setIsUploading(false)
				}
				reader.readAsDataURL(file)
			} catch (error) {
				console.error('Upload error:', error)
				toast.error('Failed to upload image')
				setIsUploading(false)
			}
		},
		[currentWorkspace, updateWorkspace]
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
		},
		maxFiles: 1,
		disabled: isUploading,
	})

	const handleRemoveLogo = async () => {
		if (!currentWorkspace) return

		try {
			await updateWorkspace.mutateAsync({
				id: currentWorkspace.id,
				logo: '',
			})
		} catch (error) {
			console.error('Remove logo error:', error)
		}
	}

	const currentLogo = preview || currentWorkspace?.logo

	return (
		<div className="space-y-4">
			{currentLogo ? (
				<div className="flex items-start gap-4">
					<div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
						<Image
							src={currentLogo}
							alt="Workspace logo"
							fill
							className="object-cover"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-sm text-muted-foreground">
							Current workspace logo
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRemoveLogo}
							disabled={updateWorkspace.isPending}
						>
							{updateWorkspace.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Removing...
								</>
							) : (
								<>
									<X className="mr-2 h-4 w-4" />
									Remove Logo
								</>
							)}
						</Button>
					</div>
				</div>
			) : (
				<div
					{...getRootProps()}
					className={`
						relative flex cursor-pointer flex-col items-center justify-center
						rounded-lg border-2 border-dashed p-12 transition-colors
						${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
						${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-accent'}
					`}
				>
					<input {...getInputProps()} />
					{isUploading ? (
						<>
							<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
							<p className="mt-4 text-sm text-muted-foreground">Uploading...</p>
						</>
					) : (
						<>
							{isDragActive ? (
								<>
									<Upload className="h-12 w-12 text-primary" />
									<p className="mt-4 text-sm font-medium text-primary">
										Drop your image here
									</p>
								</>
							) : (
								<>
									<ImageIcon className="h-12 w-12 text-muted-foreground" />
									<p className="mt-4 text-sm font-medium">
										Click to upload or drag and drop
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										PNG, JPG, WebP, or GIF (max 5MB)
									</p>
								</>
							)}
						</>
					)}
				</div>
			)}

			<div className="space-y-2">
				<p className="text-sm font-medium">Requirements:</p>
				<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>Square images work best (e.g., 512x512px)</li>
					<li>Maximum file size: 5MB</li>
					<li>Supported formats: PNG, JPG, WebP, GIF</li>
					<li>Logo will be displayed at 32x32px in the workspace switcher</li>
				</ul>
			</div>
		</div>
	)
}
