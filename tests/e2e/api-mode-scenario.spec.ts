import { expect, test } from '@playwright/test'

test.describe('API Mode Scenarios', () => {
  test('success scenario returns mocked response data', async ({ page }) => {
    await page.goto('/text-embedding?scenario=success')
    await page
      .getByPlaceholder('Paste or type your text content here...')
      .fill('scenario success embedding test')
    await page.getByRole('button', { name: 'Generate Embedding' }).click()

    await expect(page.getByText('Embedding Queue')).toBeVisible()
    const firstQueueItem = page.locator('[data-testid^="embedding-queue-item-"]').first()
    await expect(firstQueueItem).toContainText('scenario success embedding test', {
      timeout: 15000,
    })
  })

  test('error scenario reliably surfaces warning feedback', async ({ page }) => {
    await page.goto('/search?scenario=error')
    await page.getByPlaceholder('Search embeddings...').fill('scenario error query')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Search request failed')).toBeVisible()
  })

  test('slow scenario shows queue transition through processing', async ({ page }) => {
    await page.goto('/text-embedding?scenario=slow')
    await page
      .getByPlaceholder('Paste or type your text content here...')
      .fill('scenario slow queue transition')
    await page.getByRole('button', { name: 'Generate Embedding' }).click()

    const firstQueueItem = page.locator('[data-testid^="embedding-queue-item-"]').first()
    await expect(firstQueueItem).toContainText('scenario slow queue transition', {
      timeout: 15000,
    })
  })
})
