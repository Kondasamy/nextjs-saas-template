import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from '@react-email/components'

interface EmailChangeNotificationProps {
	name: string
	newEmail: string
	securityUrl: string
}

export function EmailChangeNotification({
	name,
	newEmail,
	securityUrl,
}: EmailChangeNotificationProps) {
	return (
		<Html>
			<Head />
			<Preview>Email change request notification</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Email Change Request</Heading>
					<Text style={text}>Hi {name},</Text>
					<Text style={text}>
						A request has been made to change your account email address to:
					</Text>
					<Text style={highlightBox}>{newEmail}</Text>
					<Text style={text}>
						If you made this request, please verify your new email address by
						clicking the verification link sent to {newEmail}.
					</Text>
					<Text style={warningText}>
						<strong>If you didn't request this change:</strong>
					</Text>
					<Text style={text}>
						Please secure your account immediately. Someone may have
						unauthorized access to your account.
					</Text>
					<Button style={button} href={securityUrl}>
						Review Security Settings
					</Button>
					<Text style={footer}>
						This is an automated security notification. For security reasons,
						please do not reply to this email.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}

const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '20px 0 48px',
	marginBottom: '64px',
	maxWidth: '560px',
}

const h1 = {
	color: '#333',
	fontSize: '24px',
	fontWeight: 'bold',
	margin: '40px 0',
	padding: '0',
}

const text = {
	color: '#333',
	fontSize: '16px',
	lineHeight: '26px',
	marginBottom: '16px',
}

const highlightBox = {
	backgroundColor: '#f6f9fc',
	border: '1px solid #e6e6e6',
	borderRadius: '4px',
	padding: '12px 16px',
	fontSize: '16px',
	fontWeight: 'bold',
	color: '#007ee6',
	margin: '16px 0',
}

const warningText = {
	color: '#d93025',
	fontSize: '16px',
	lineHeight: '26px',
	marginBottom: '8px',
	marginTop: '24px',
}

const button = {
	backgroundColor: '#d93025',
	borderRadius: '4px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: 'bold',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'block',
	padding: '12px 24px',
	margin: '20px 0',
}

const footer = {
	color: '#666',
	fontSize: '14px',
	lineHeight: '22px',
	marginTop: '24px',
	paddingTop: '24px',
	borderTop: '1px solid #e6e6e6',
}
