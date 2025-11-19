import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from '@react-email/components'

interface WelcomeEmailProps {
	name?: string
}

export function WelcomeEmail({ name = 'there' }: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Welcome to our platform!</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Welcome, {name}!</Heading>
					<Text style={text}>
						Thank you for joining us. We're excited to have you on board!
					</Text>
					<Text style={text}>
						Get started by exploring your dashboard and setting up your
						workspace.
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
