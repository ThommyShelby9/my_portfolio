import { test, expect } from '@playwright/test'

test.describe('Navigation smoke', () => {
  test('home loads with hero, featured, approach, CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('logiciels fiables')
    await expect(page.locator('text=Travaux récents').first()).toBeVisible()
    await expect(page.locator('text=Comment je travaille').first()).toBeVisible()
    await expect(page.locator('text=Démarrer un brief').first()).toBeVisible()
  })

  test('all primary routes return 200 in FR', async ({ page }) => {
    const routes = ['/', '/work', '/work/banque-regionale', '/about', '/contact', '/brief']
    for (const r of routes) {
      const resp = await page.goto(r)
      expect(resp?.status(), `route ${r}`).toBeLessThan(400)
    }
  })

  test('all primary routes return 200 in EN', async ({ page }) => {
    const routes = ['/en', '/en/work', '/en/work/banque-regionale', '/en/about', '/en/contact', '/en/brief']
    for (const r of routes) {
      const resp = await page.goto(r)
      expect(resp?.status(), `route ${r}`).toBeLessThan(400)
    }
  })

  test('EN home renders English copy', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('h1')).toContainText('reliable software')
    await expect(page.locator('text=Start a brief').first()).toBeVisible()
  })

  test('case study renders body markdown', async ({ page }) => {
    await page.goto('/work/banque-regionale')
    await expect(page.locator('h1')).toContainText('paiement')
    await expect(page.locator('text=Le contexte').first()).toBeVisible()
    await expect(page.locator('text=+180 %').first()).toBeVisible()
  })
})
