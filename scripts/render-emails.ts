// Renders every template in emails/ and fails if any throws, renders empty,
// leaks a missing prop ("undefined"/"null") or has a link with no target.
// Run in CI after the build: `pnpm test:emails`.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { render } from 'react-email'

// One value for every prop the templates declare (see their *Props interfaces)
const sample: Record<string, unknown> = {
	name: 'Ada Lovelace',
	userName: 'Ada Lovelace',
	userEmail: 'ada@example.com',
	newEmail: 'ada@new.example.com',
	inviterName: 'Grace Hopper',
	organizationName: 'Acme',
	magicLink: 'https://example.com/magic',
	resetUrl: 'https://example.com/reset',
	verificationUrl: 'https://example.com/verify',
	invitationUrl: 'https://example.com/invite',
	securityUrl: 'https://example.com/security',
	code: '123456',
	subject: 'Hello',
	message: 'Sample message',
	category: 'bug',
	priority: 'High',
	timestamp: 'January 1, 2026 at 00:00 UTC',
	device: 'Chrome on macOS',
	location: 'London, UK',
}

// Extra renders for templates with prop-dependent branches
const variants: Record<string, Record<string, unknown>[]> = {
	// verification.tsx shows a button when no code is passed
	'verification.tsx': [{ ...sample, code: undefined }],
}

function problems(html: string): string[] {
	const found: string[] = []
	if (!html.includes('<html') || html.length < 500) {
		found.push(`suspiciously small output (${html.length} chars)`)
	}
	const text = html.replace(/<[^>]+>/g, ' ')
	if (/\b(undefined|null|NaN)\b/.test(text)) found.push('missing prop rendered')
	// A missing URL prop renders an <a> with no href at all, or an empty one
	const anchors = html.match(/<a\b[^>]*>/g) ?? []
	if (anchors.some((a) => !/\bhref="(https?:|mailto:)[^"]+"/.test(a))) {
		found.push('link with no target')
	}
	return found
}

async function main() {
	const dir = join(process.cwd(), 'emails')
	const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))
	let failed = 0

	for (const file of files) {
		const mod = await import(pathToFileURL(join(dir, file)).href)
		const Component =
			mod.default ?? Object.values(mod).find((v) => typeof v === 'function')
		for (const props of [sample, ...(variants[file] ?? [])]) {
			const label = props === sample ? file : `${file} (variant)`
			try {
				if (typeof Component !== 'function') {
					throw new Error('no component export')
				}
				const html = await render(createElement(Component, props))
				const issues = problems(html)
				if (issues.length) throw new Error(issues.join('; '))
				console.log(`ok   ${label} (${html.length} chars)`)
			} catch (error) {
				failed++
				console.error(
					`FAIL ${label}: ${error instanceof Error ? error.message : error}`
				)
			}
		}
	}

	console.log(failed ? `${failed} render(s) failed` : 'all templates rendered')
	if (files.length === 0 || failed > 0) process.exit(1)
}

main()
