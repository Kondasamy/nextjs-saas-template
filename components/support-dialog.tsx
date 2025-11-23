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
import { Input } from '@/components/ui/input'
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

const supportSchema = z.object({
	subject: z.string().min(5, 'Subject must be at least 5 characters'),
	priority: z.enum(['Low', 'Medium', 'High']),
	message: z.string().min(10, 'Message must be at least 10 characters'),
})

type SupportFormData = z.infer<typeof supportSchema>

interface SupportDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<SupportFormData>({
		resolver: zodResolver(supportSchema),
		defaultValues: {
			subject: '',
			priority: 'Medium',
			message: '',
		},
	})

	const submitSupport = trpc.feedback.submitSupport.useMutation()

	const handleSubmit = async (data: SupportFormData) => {
		setIsLoading(true)
		try {
			await submitSupport.mutateAsync(data)
			toast.success('Support request submitted successfully!')
			form.reset()
			onOpenChange(false)
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to submit support request. Please try again.'
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Contact Support</DialogTitle>
					<DialogDescription>
						Need help? Submit a support request and we'll get back to you as
						soon as possible.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="subject">Subject</Label>
						<Input
							id="subject"
							placeholder="Brief description of your issue"
							{...form.register('subject')}
						/>
						{form.formState.errors.subject && (
							<p className="text-sm text-destructive">
								{form.formState.errors.subject.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="priority">Priority</Label>
						<Select
							value={form.watch('priority')}
							onValueChange={(value) =>
								form.setValue('priority', value as SupportFormData['priority'])
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Low">Low - General question</SelectItem>
								<SelectItem value="Medium">
									Medium - Issue affecting work
								</SelectItem>
								<SelectItem value="High">
									High - Critical issue or blocker
								</SelectItem>
							</SelectContent>
						</Select>
						{form.formState.errors.priority && (
							<p className="text-sm text-destructive">
								{form.formState.errors.priority.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="message">Message</Label>
						<Textarea
							id="message"
							placeholder="Describe your issue in detail..."
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
							{isLoading ? 'Submitting...' : 'Submit Request'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
