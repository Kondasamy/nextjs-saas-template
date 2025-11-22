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

interface EmailChangeVerificationProps {
	verificationUrl: string
	name: string
}

export function EmailChangeVerification({
	verificationUrl,
	name,
}: EmailChangeVerificationProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your new email address</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Verify Your New Email Address</Heading>
					<Text style={text}>Hi {name},</Text>
					<Text style={text}>
						You've requested to change your email address. Please click the
						button below to verify your new email address and complete the
						change.
					</Text>
					<Button style={button} href={verificationUrl}>
						Verify New Email
					</Button>
					<Text style={text}>
						This link will expire in 24 hours. If you didn't request this email
						change, please ignore this email and your email address will remain
						unchanged.
					</Text>
					<Text style={footer}>
						For security reasons, all your active sessions will be logged out
						after verification, and you'll need to sign in again with your new
						email address.
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

const button = {
	backgroundColor: '#007ee6',
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
