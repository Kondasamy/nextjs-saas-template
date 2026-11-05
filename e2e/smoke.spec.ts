import { expect, type Page, test } from '@playwright/test'

// Seeded by prisma/seed.ts
const DEMO_EMAIL = 'demo@yourdomain.com'
const DEMO_PASSWORD = 'demo1234'

async function signIn(page: Page, password = DEMO_PASSWORD) {
	await page.goto('/login')
	await page.locator('#email').fill(DEMO_EMAIL)
	await page.locator('#password').fill(password)
	await page.getByRole('button', { name: 'Sign In', exact: true }).click()
}

test('login page renders the sign-in form', async ({ page }) => {
	const res = await page.goto('/login')
	expect(res?.status()).toBe(200)
	await expect(page.locator('#email')).toBeVisible()
	await expect(page.locator('#password')).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Sign In', exact: true })
	).toBeVisible()
})

test('sign-in form shows zod validation messages', async ({ page }) => {
	await page.goto('/login')
	await page.locator('#password').fill('short')
	await page.getByRole('button', { name: 'Sign In', exact: true }).click()
	await expect(page.getByText('Invalid email address')).toBeVisible()
	await expect(
		page.getByText('Password must be at least 8 characters')
	).toBeVisible()
	await expect(page).toHaveURL(/\/login/)
})

test('social sign-in buttons render a logo and an accessible name', async ({
	page,
}) => {
	await page.goto('/login')
	for (const name of ['Continue with Google', 'Continue with GitHub']) {
		const button = page.getByRole('button', { name })
		await expect(button).toBeVisible()
		await expect(button.locator('svg')).toBeVisible()
	}
})

test('protected routes redirect signed-out visitors to /login', async ({
	page,
}) => {
	await page.goto('/')
	await expect(page).toHaveURL(/\/login/)
})

test('wrong password shows an error and stays on /login', async ({ page }) => {
	await signIn(page, 'not-the-password')
	await expect(
		page.getByText(/invalid|failed|incorrect/i).first()
	).toBeVisible()
	await expect(page).toHaveURL(/\/login/)
})

test('demo user signs in, sees the dashboard, and signs out', async ({
	page,
}) => {
	await signIn(page)
	await expect(
		page.getByRole('heading', { name: 'Dashboard', level: 1 })
	).toBeVisible({ timeout: 20_000 })
	await expect(page.getByText(DEMO_EMAIL).first()).toBeVisible()

	await page.getByText(DEMO_EMAIL).first().click()
	await page.getByRole('menuitem', { name: /log out/i }).click()
	await expect(page).toHaveURL(/\/login/)

	await page.goto('/')
	await expect(page).toHaveURL(/\/login/)
})

test('robots.txt is public for signed-out crawlers', async ({ request }) => {
	const res = await request.get('/robots.txt', { maxRedirects: 0 })
	expect(res.status()).toBe(200)
	const body = await res.text()
	expect(body).toMatch(/User-Agent:/i)
	expect(body).toMatch(/Sitemap:/i)
})

test('matcher change keeps / protected', async ({ request }) => {
	const res = await request.get('/', { maxRedirects: 0 })
	expect(res.status()).toBeGreaterThanOrEqual(300)
	expect(res.status()).toBeLessThan(400)
	expect(res.headers().location).toMatch(/\/login/)
})

test('X-Robots-Tag is absent when NOINDEX is unset', async ({ request }) => {
	const res = await request.get('/login')
	expect(res.headers()['x-robots-tag']).toBeUndefined()
})
