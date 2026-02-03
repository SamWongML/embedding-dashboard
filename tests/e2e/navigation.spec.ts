import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows server status page by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Server Status' })).toBeVisible()
  })

  test('navigates to metrics page', async ({ page }) => {
    await page.getByRole('link', { name: 'Metrics' }).click()
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible()
  })

  test('navigates to text embedding page', async ({ page }) => {
    await page.getByRole('link', { name: 'Text Embedding' }).click()
    await expect(page.getByRole('heading', { name: 'Text Embedding' })).toBeVisible()
  })

  test('navigates to search page', async ({ page }) => {
    await page.getByRole('link', { name: 'Hybrid Search' }).click()
    await expect(page.getByRole('heading', { name: 'Hybrid Search' })).toBeVisible()
  })

  test('navigates to records page', async ({ page }) => {
    await page.getByRole('link', { name: 'Records' }).click()
    await expect(page.getByRole('heading', { name: 'Embedding Records' })).toBeVisible()
  })

  test('navigates to graph page', async ({ page }) => {
    await page.getByRole('link', { name: 'Graph' }).click()
    await expect(page.getByRole('heading', { name: 'Knowledge Graph' })).toBeVisible()
  })

  test('navigates to users page', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click()
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible()
  })
})

test.describe('Command Menu', () => {
  test('opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Meta+k')
    await expect(page.getByPlaceholder('Type a command or search...')).toBeVisible()
  })

  test('navigates via command menu', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Meta+k')
    await page.getByPlaceholder('Type a command or search...').fill('metrics')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible()
  })
})

test.describe('Sidebar', () => {
  test('collapses and expands', async ({ page }) => {
    await page.goto('/')

    // Find and click collapse button
    const collapseButton = page.getByRole('button', { name: 'Toggle sidebar' })
    await collapseButton.click()

    // Sidebar should be collapsed (narrow width)
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/w-16/)

    // Click again to expand
    await collapseButton.click()
    await expect(sidebar).toHaveClass(/w-64/)
  })
})
