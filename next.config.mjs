import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
	typescript: {
		ignoreBuildErrors: false,
	},
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
}

const withMDX = createMDX({
	extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
