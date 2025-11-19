'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface FileUploadProps {
	bucket: string
	path?: string
	onUploadComplete?: (url: string) => void
	maxSize?: number
	accept?: Record<string, string[]>
}

export function FileUpload({
	bucket,
	path = '',
	onUploadComplete,
	maxSize = 10 * 1024 * 1024, // 10MB default
	accept,
}: FileUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [file, setFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			if (selectedFile.size > maxSize) {
				toast.error('File size exceeds maximum allowed size')
				return
			}
			setFile(selectedFile)
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const droppedFile = e.dataTransfer.files[0]
		if (droppedFile) {
			if (droppedFile.size > maxSize) {
				toast.error('File size exceeds maximum allowed size')
				return
			}
			setFile(droppedFile)
		}
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const uploadFile = async () => {
		if (!file) return

		setUploading(true)
		setProgress(0)

		try {
			// Get upload URL from tRPC
			const uploadUrl = await trpc.storage.getUploadUrl.mutate({
				bucket,
				path: path || file.name,
				contentType: file.type,
			})

			// Upload file to Supabase
			const response = await fetch(uploadUrl.url, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			})

			if (!response.ok) {
				throw new Error('Upload failed')
			}

			// Get public URL
			const publicUrl = await trpc.storage.getPublicUrl.query({
				bucket,
				path: path || file.name,
			})

			toast.success('File uploaded successfully')
			onUploadComplete?.(publicUrl.publicUrl)
			setFile(null)
			setProgress(100)
		} catch (error) {
			toast.error('Failed to upload file')
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="space-y-4">
			<div
				className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={() => fileInputRef.current?.click()}
			>
				<input
					ref={fileInputRef}
					type="file"
					onChange={handleFileSelect}
					accept={accept ? Object.keys(accept).join(',') : undefined}
					className="hidden"
				/>
				<Upload className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
				<p className="text-sm text-muted-foreground">
					Click to select a file or drag and drop
				</p>
			</div>

			{file && (
				<div className="flex items-center justify-between p-4 border rounded-lg">
					<div className="flex-1">
						<p className="text-sm font-medium">{file.name}</p>
						<p className="text-xs text-muted-foreground">
							{(file.size / 1024 / 1024).toFixed(2)} MB
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setFile(null)}
						disabled={uploading}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			{uploading && <Progress value={progress} />}

			{file && !uploading && (
				<Button onClick={uploadFile} className="w-full">
					Upload File
				</Button>
			)}
		</div>
	)
}
