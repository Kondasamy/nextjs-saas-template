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

interface PasswordChangedProps {
	name: string
	resetUrl: string
	timestamp: string
	device?: string
	location?: string
}

export function PasswordChanged({
	name,
	resetUrl,
	timestamp,
	device,
	location,
}: PasswordChangedProps) {
	return (
		<Html>
			<Head />
			<Preview>Your password was changed</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Password Changed</Heading>
					<Text style={text}>Hi {name},</Text>
					<Text style={text}>
						Your account password was successfully changed.
					</Text>

					<div style={detailsBox}>
						<Text style={detailsTitle}>Change Details:</Text>
						<Text style={detailsText}>
							<strong>Time:</strong> {timestamp}
						</Text>
						{device && (
							<Text style={detailsText}>
								<strong>Device:</strong> {device}
							</Text>
						)}
						{location && (
							<Text style={detailsText}>
								<strong>Location:</strong> {location}
							</Text>
						)}
					</div>

					<div style={warningBox}>
						<Text style={warningTitle}>Wasn't you?</Text>
						<Text style={warningText}>
							If you didn't make this change, your account may be compromised.
							Reset your password immediately to secure your account.
						</Text>
						<Button style={button} href={resetUrl}>
							Reset Password Now
						</Button>
					</div>

					<Text style={footer}>
						For security, all other sessions on your account have been logged
						out. You'll need to sign in again on any other devices.
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

const detailsBox = {
	backgroundColor: '#f6f9fc',
	border: '1px solid #e6e6e6',
	borderRadius: '4px',
	padding: '16px',
	margin: '20px 0',
}

const detailsTitle = {
	fontSize: '14px',
	fontWeight: 'bold',
	color: '#666',
	marginBottom: '12px',
	margin: '0 0 12px 0',
}

const detailsText = {
	fontSize: '14px',
	color: '#333',
	margin: '4px 0',
	lineHeight: '20px',
}

const warningBox = {
	backgroundColor: '#fff3cd',
	border: '1px solid #ffc107',
	borderRadius: '4px',
	padding: '16px',
	margin: '24px 0',
}

const warningTitle = {
	fontSize: '16px',
	fontWeight: 'bold',
	color: '#856404',
	margin: '0 0 8px 0',
}

const warningText = {
	fontSize: '14px',
	color: '#856404',
	margin: '0 0 16px 0',
	lineHeight: '22px',
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
	margin: '0',
}

const footer = {
	color: '#666',
	fontSize: '14px',
	lineHeight: '22px',
	marginTop: '24px',
	paddingTop: '24px',
	borderTop: '1px solid #e6e6e6',
}
