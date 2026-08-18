import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home renders its hero heading (content independent of the film layer)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('the film atmosphere is present and hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const film = page.locator('.film')
  await expect(film).toHaveCount(1)
  await expect(film).toHaveAttribute('aria-hidden', 'true')
})

test('reduced motion: home renders with no critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
