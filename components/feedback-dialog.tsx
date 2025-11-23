'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'

const feedbackSchema = z.object({
	category: z.enum(['Bug Report', 'Feature Request', 'Improvement', 'Other']),
	message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FeedbackDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<FeedbackFormData>({
		resolver: zodResolver(feedbackSchema),
		defaultValues: {
			category: 'Feature Request',
			message: '',
		},
	})

	const submitFeedback = trpc.feedback.submitFeedback.useMutation()

	const handleSubmit = async (data: FeedbackFormData) => {
		setIsLoading(true)
		try {
			await submitFeedback.mutateAsync(data)
			toast.success('Thank you for your feedback!')
			form.reset()
			onOpenChange(false)
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to submit feedback. Please try again.'
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Send Feedback</DialogTitle>
					<DialogDescription>
						We value your feedback! Let us know what you think or suggest
						improvements.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={form.watch('category')}
							onValueChange={(value) =>
								form.setValue('category', value as FeedbackFormData['category'])
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Bug Report">Bug Report</SelectItem>
								<SelectItem value="Feature Request">Feature Request</SelectItem>
								<SelectItem value="Improvement">Improvement</SelectItem>
								<SelectItem value="Other">Other</SelectItem>
							</SelectContent>
						</Select>
						{form.formState.errors.category && (
							<p className="text-sm text-destructive">
								{form.formState.errors.category.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="message">Message</Label>
						<Textarea
							id="message"
							placeholder="Tell us what's on your mind..."
							rows={6}
							{...form.register('message')}
						/>
						{form.formState.errors.message && (
							<p className="text-sm text-destructive">
								{form.formState.errors.message.message}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Sending...' : 'Send Feedback'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
