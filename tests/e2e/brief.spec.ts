import { test, expect } from '@playwright/test'

test.describe('Brief funnel smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brief')
    await page.evaluate(() => localStorage.clear())
  })

  test('renders step 1 with project type and pitch field', async ({ page }) => {
    await page.goto('/brief')
    await expect(page.locator('h1')).toContainText('Démarrer un brief')
    await expect(page.locator('text=Construire un produit depuis zéro').first()).toBeVisible()
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('text=Continuer →').first()).toBeVisible()
  })

  test('Continuer advances to step 2 with state options', async ({ page }) => {
    await page.goto('/brief')
    await page.locator('text=Construire un produit depuis zéro').click()
    await page.locator('textarea').fill('Une plateforme de paiement B2B pour PME africaines.')
    await page.locator('text=Continuer →').click()
    await expect(page.locator('text=Idée / spec papier').first()).toBeVisible({ timeout: 10000 })
  })

  test('confirmation page renders correctly via direct visit', async ({ page }) => {
    await page.goto('/brief/confirmation')
    await expect(page.locator('h1')).toContainText('Brief reçu')
  })

  test('confirmation page shows Calendly section when ?call=1', async ({ page }) => {
    await page.goto('/brief/confirmation?call=1')
    await expect(page.locator('text=Réserver un appel de 30 min').first()).toBeVisible()
  })
})
