'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc/client'

const deleteAccountSchema = z.object({
	confirmation: z.literal('DELETE', {
		errorMap: () => ({ message: 'Please type DELETE to confirm' }),
	}),
	password: z.string().min(1, 'Password is required'),
})

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>

export function DeleteAccountForm() {
	const [isOpen, setIsOpen] = useState(false)
	const router = useRouter()

	const form = useForm<DeleteAccountFormData>({
		resolver: zodResolver(deleteAccountSchema),
		defaultValues: {
			confirmation: '' as any,
			password: '',
		},
	})

	const deleteAccount = trpc.user.deleteAccount.useMutation({
		onSuccess: () => {
			toast.success('Account deleted successfully')
			// Redirect to homepage after deletion
			setTimeout(() => {
				router.push('/')
			}, 1000)
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to delete account')
		},
	})

	const handleDelete = async (data: DeleteAccountFormData) => {
		try {
			// Verify password with Better Auth before deleting
			const response = await fetch('/api/auth/verify-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					password: data.password,
				}),
			})

			if (!response.ok) {
				throw new Error('Invalid password')
			}

			// Delete account
			await deleteAccount.mutateAsync()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete account'
			)
		}
	}

	return (
		<Card className="border-destructive">
			<CardHeader>
				<CardTitle className="text-destructive">Danger Zone</CardTitle>
				<CardDescription>
					Permanently delete your account and all associated data
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
					<AlertDialogTrigger asChild>
						<Button variant="destructive" className="w-full">
							<AlertTriangle className="mr-2 h-4 w-4" />
							Delete Account
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account and remove all your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<form
							onSubmit={form.handleSubmit(handleDelete)}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="confirmation">
									Type <strong>DELETE</strong> to confirm
								</Label>
								<Input
									id="confirmation"
									{...form.register('confirmation')}
									placeholder="DELETE"
								/>
								{form.formState.errors.confirmation && (
									<p className="text-sm text-destructive">
										{form.formState.errors.confirmation.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">
									Confirm Password <span className="text-destructive">*</span>
								</Label>
								<Input
									id="password"
									type="password"
									{...form.register('password')}
									placeholder="Enter your password"
								/>
								{form.formState.errors.password && (
									<p className="text-sm text-destructive">
										{form.formState.errors.password.message}
									</p>
								)}
							</div>

							<AlertDialogFooter>
								<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
								<Button
									type="submit"
									variant="destructive"
									disabled={deleteAccount.isPending}
								>
									{deleteAccount.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										'Delete Account'
									)}
								</Button>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>

				<p className="mt-4 text-sm text-muted-foreground">
					Once you delete your account, there is no going back. Please be
					certain.
				</p>
			</CardContent>
		</Card>
	)
}
