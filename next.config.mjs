import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
	typescript: {
		ignoreBuildErrors: true,
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
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://va.vercel-scripts.com",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: blob: https: http:",
							"font-src 'self' data:",
							"connect-src 'self' https://api.github.com https://api.dicebear.com https://*.supabase.co https://*.googleapis.com wss://*.supabase.co",
							"media-src 'self'",
							"object-src 'none'",
							"child-src 'self'",
							"frame-src 'self' https://challenges.cloudflare.com",
							"worker-src 'self' blob:",
							"form-action 'self'",
							"frame-ancestors 'self'",
							"base-uri 'self'",
							"manifest-src 'self'",
							'upgrade-insecure-requests',
						].join('; '),
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
