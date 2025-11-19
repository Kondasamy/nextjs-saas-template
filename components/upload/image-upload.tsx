'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileUpload } from './file-upload'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ImageUploadProps {
	bucket?: string
	path?: string
	value?: string
	onChange?: (url: string) => void
}

export function ImageUpload({
	bucket = 'avatars',
	path,
	value,
	onChange,
}: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(value ?? null)

	const handleUploadComplete = (url: string) => {
		setPreview(url)
		onChange?.(url)
	}

	const handleRemove = () => {
		setPreview(null)
		onChange?.('')
	}

	return (
		<div className="space-y-4">
			{preview ? (
				<div className="relative w-32 h-32 rounded-lg overflow-hidden border">
					<Image
						src={preview}
						alt="Preview"
						fill
						className="object-cover"
					/>
					<Button
						variant="destructive"
						size="icon"
						className="absolute top-2 right-2"
						onClick={handleRemove}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<FileUpload
					bucket={bucket}
					path={path}
					onUploadComplete={handleUploadComplete}
					accept={{
						'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
					}}
					maxSize={5 * 1024 * 1024} // 5MB
				/>
			)}
		</div>
	)
}

