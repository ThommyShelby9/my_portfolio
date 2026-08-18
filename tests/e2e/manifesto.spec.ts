import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the thesis hero heading is present (content independent of the engine)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
})

test('all four crédo scenes render their titles in the DOM (SSR content)', async ({ page }) => {
  await page.goto('/')
  for (const line of [
    'Ce qui casse en production ne prévient jamais.',
    'On livre chaque semaine. Ou on ne livre pas.',
    'Le code que je laisse doit tourner sans moi.',
    'Je vous dirai ce qui ne marche pas. Surtout ça.',
  ]) {
    await expect(page.getByText(line, { exact: false })).toBeVisible()
  }
})

test('the fixed Gargantua stage is present and hidden from assistive tech', async ({ page }) => {
  await page.goto('/')
  const stage = page.locator('.gz-stage')
  await expect(stage).toHaveCount(1)
  await expect(stage).toHaveAttribute('aria-hidden', 'true')
})

test('reduced motion: home renders with no serious/critical a11y violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#hero-heading')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
})
