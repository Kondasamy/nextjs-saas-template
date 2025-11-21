'use client'

import { Eye, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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

const EMAIL_TEMPLATES = [
	{
		id: 'welcome',
		name: 'Welcome Email',
		description: 'Sent to new users after successful signup',
		category: 'Authentication',
		fields: [
			{ name: 'name', label: 'User Name', type: 'text', default: 'John Doe' },
		],
	},
	{
		id: 'verification',
		name: 'Email Verification',
		description: 'Contains verification link and optional code',
		category: 'Authentication',
		fields: [
			{ name: 'name', label: 'User Name', type: 'text', default: 'John Doe' },
			{
				name: 'code',
				label: 'Verification Code',
				type: 'text',
				default: '123456',
			},
		],
	},
	{
		id: 'password-reset',
		name: 'Password Reset',
		description: 'Sent when user requests password reset',
		category: 'Authentication',
		fields: [
			{ name: 'name', label: 'User Name', type: 'text', default: 'John Doe' },
		],
	},
	{
		id: 'magic-link',
		name: 'Magic Link',
		description: 'Passwordless authentication link',
		category: 'Authentication',
		fields: [],
	},
	{
		id: 'invitation',
		name: 'Team Invitation',
		description: 'Workspace invitation for new team members',
		category: 'Workspace',
		fields: [
			{
				name: 'inviterName',
				label: 'Inviter Name',
				type: 'text',
				default: 'Jane Smith',
			},
			{
				name: 'organizationName',
				label: 'Organization',
				type: 'text',
				default: 'Acme Corp',
			},
		],
	},
	{
		id: 'two-factor',
		name: '2FA Code',
		description: 'Two-factor authentication code',
		category: 'Security',
		fields: [
			{ name: 'name', label: 'User Name', type: 'text', default: 'John Doe' },
			{ name: 'code', label: '2FA Code', type: 'text', default: '789012' },
		],
	},
]

export function EmailTemplatesManager() {
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
	const [previewOpen, setPreviewOpen] = useState(false)
	const [testEmailOpen, setTestEmailOpen] = useState(false)
	const [testEmail, setTestEmail] = useState('')
	const [sending, setSending] = useState(false)

	const template = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)

	const handlePreview = (templateId: string) => {
		setSelectedTemplate(templateId)
		setPreviewOpen(true)
	}

	const handleTestEmail = (templateId: string) => {
		setSelectedTemplate(templateId)
		setTestEmailOpen(true)
	}

	const sendTestEmail = async () => {
		if (!testEmail) {
			toast.error('Please enter an email address')
			return
		}

		setSending(true)
		try {
			const response = await fetch('/api/admin/emails/test', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					template: selectedTemplate,
					email: testEmail,
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to send test email')
			}

			toast.success(`Test email sent to ${testEmail}`)
			setTestEmailOpen(false)
			setTestEmail('')
		} catch (error) {
			console.error('Error sending test email:', error)
			toast.error('Failed to send test email')
		} finally {
			setSending(false)
		}
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Template Gallery</CardTitle>
					<CardDescription>
						Preview and test email templates before sending to users
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{EMAIL_TEMPLATES.map((template) => (
							<Card key={template.id} className="border-2">
								<CardHeader>
									<div className="flex items-start justify-between">
										<Mail className="h-5 w-5 text-primary" />
										<span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-1">
											{template.category}
										</span>
									</div>
									<CardTitle className="text-lg">{template.name}</CardTitle>
									<CardDescription className="text-xs">
										{template.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => handlePreview(template.id)}
									>
										<Eye className="mr-2 h-4 w-4" />
										Preview
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => handleTestEmail(template.id)}
									>
										<Send className="mr-2 h-4 w-4" />
										Test
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Preview Dialog */}
			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{template?.name}</DialogTitle>
						<DialogDescription>{template?.description}</DialogDescription>
					</DialogHeader>
					<div className="border rounded-lg overflow-hidden">
						<iframe
							src={`/api/email/preview?template=${selectedTemplate}`}
							className="w-full h-[600px]"
							title="Email Preview"
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Test Email Dialog */}
			<Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send Test Email</DialogTitle>
						<DialogDescription>
							Send a test {template?.name.toLowerCase()} to verify the template
							works correctly
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="template">Template</Label>
							<Select value={selectedTemplate || undefined} disabled>
								<SelectTrigger id="template">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{EMAIL_TEMPLATES.map((t) => (
										<SelectItem key={t.id} value={t.id}>
											{t.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Recipient Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="test@example.com"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
							/>
						</div>

						{template?.fields && template.fields.length > 0 && (
							<div className="rounded-lg bg-muted p-4 space-y-2">
								<p className="text-sm font-medium">Template will use:</p>
								<ul className="text-sm text-muted-foreground space-y-1">
									{template.fields.map((field) => (
										<li key={field.name}>
											<span className="font-medium">{field.label}:</span>{' '}
											{field.default}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setTestEmailOpen(false)}
							>
								Cancel
							</Button>
							<Button
								className="flex-1"
								onClick={sendTestEmail}
								disabled={sending}
							>
								<Send className="mr-2 h-4 w-4" />
								{sending ? 'Sending...' : 'Send Test'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
