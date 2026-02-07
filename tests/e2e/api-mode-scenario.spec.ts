import { expect, test } from '@playwright/test'

test.describe('API Mode Scenarios', () => {
  test('success scenario returns mocked response data', async ({ page }) => {
    await page.goto('/text-embedding?scenario=success')

    await expect(page.getByText('Simulated API: success')).toBeVisible()
    await page
      .getByPlaceholder('Enter text to create an embedding...')
      .fill('scenario success embedding test')
    await page.getByRole('button', { name: 'Create Embedding' }).click()

    await expect(page.getByText('Vector Preview')).toBeVisible()
    await expect(page.getByText('Text embedding request failed')).not.toBeVisible()
  })

  test('error scenario reliably surfaces warning feedback', async ({ page }) => {
    await page.goto('/search?scenario=error')

    await expect(page.getByText('Simulated API: error')).toBeVisible()
    await page.getByPlaceholder('Search embeddings...').fill('scenario error query')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Search request failed')).toBeVisible()
  })

  test('slow scenario shows pending state before resolving', async ({ page }) => {
    await page.goto('/search?scenario=slow')

    await expect(page.getByText('Simulated API: slow')).toBeVisible()
    await page.getByRole('tab', { name: 'Technical' }).click()
    await page.getByRole('textbox', { name: 'Query' }).fill('scenario slow query')
    await page.getByRole('button', { name: 'Search', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Searching...' })).toBeVisible()
    await expect(page.getByText(/Results \(\d+\)/)).toBeVisible({ timeout: 15000 })
  })
})
