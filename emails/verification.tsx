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

interface VerificationEmailProps {
	verificationUrl: string
}

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your email address</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Verify your email</Heading>
					<Text style={text}>
						Please click the button below to verify your email address.
					</Text>
					<Button style={button} href={verificationUrl}>
						Verify Email
					</Button>
					<Text style={text}>
						If you didn't create an account, you can safely ignore this email.
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
