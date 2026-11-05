// Renders every template in emails/ and fails if any throws or renders empty.
// Run in CI after the build: `pnpm exec tsx scripts/render-emails.ts`.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { render } from 'react-email'

// Sample values covering the props the templates read
const sample: Record<string, unknown> = {
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	userEmail: 'ada@example.com',
	oldEmail: 'ada@example.com',
	newEmail: 'ada@new.example.com',
	url: 'https://example.com/action',
	link: 'https://example.com/action',
	magicLink: 'https://example.com/magic',
	resetLink: 'https://example.com/reset',
	verificationUrl: 'https://example.com/verify',
	inviteLink: 'https://example.com/invite',
	code: '123456',
	otp: '123456',
	inviterName: 'Grace Hopper',
	workspaceName: 'Acme',
	organizationName: 'Acme',
	roleName: 'Member',
	subject: 'Hello',
	message: 'Sample message',
	type: 'bug',
	timestamp: 'January 1, 2026 at 00:00 UTC',
	changedAt: new Date('2026-01-01T00:00:00Z'),
	ipAddress: '127.0.0.1',
	userAgent: 'Mozilla/5.0',
}

async function main() {
	const dir = join(process.cwd(), 'emails')
	const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))
	let failed = 0

	for (const file of files) {
		const mod = await import(pathToFileURL(join(dir, file)).href)
		const Component =
			mod.default ?? Object.values(mod).find((v) => typeof v === 'function')
		try {
			if (typeof Component !== 'function')
				throw new Error('no component export')
			const html = await render(createElement(Component, sample))
			if (!html.includes('<html') || html.length < 500) {
				throw new Error(
					`rendered suspiciously small output (${html.length} chars)`
				)
			}
			console.log(`ok   ${file} (${html.length} chars)`)
		} catch (error) {
			failed++
			console.error(
				`FAIL ${file}: ${error instanceof Error ? error.message : error}`
			)
		}
	}

	console.log(`${files.length - failed}/${files.length} templates rendered`)
	if (files.length === 0 || failed > 0) process.exit(1)
}

main()
