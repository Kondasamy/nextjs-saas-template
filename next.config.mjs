import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
	typescript: {
		ignoreBuildErrors: false,
	},
	turbopack: {},
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				hostname: 'placehold.co',
			},
			{
				hostname: 'api.dicebear.com',
			},
			{
				hostname: 'github.com',
			},
			{
				hostname: '*.googleapis.com',
			},
			{
				hostname: 'imagedelivery.net',
			},
			{
				hostname: 'raw.githubusercontent.com',
			},
		],
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value:
							'camera=(), microphone=(), geolocation=(), interest-cohort=()',
					},
				],
			},
		]
	},
}

const withMDX = createMDX({
	extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
