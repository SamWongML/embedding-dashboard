import { test, expect, type Page } from '@playwright/test'

async function setServiceModeFromAccount(page: Page, mode: 'simple' | 'technical') {
  await page.goto('/settings?tab=account')
  const label = mode === 'simple' ? 'Simple' : 'Technical'
  const radio = page.getByRole('radio', { name: new RegExp(`^${label}`, 'i') })
  await radio.check()
  await expect(radio).toBeChecked()
}

test.describe('Text Embedding', () => {
  test('shows simple mode by default', async ({ page }) => {
    await page.goto('/text-embedding')
    await expect(page.getByRole('button', { name: 'Show Advanced' })).toHaveCount(0)
  })

  test('applies technical mode from account settings across services', async ({ page }) => {
    await setServiceModeFromAccount(page, 'technical')

    await page.goto('/text-embedding')
    await expect(page.getByText(/Chunk Size:/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show Advanced' })).toBeVisible()

    await page.goto('/search')
    await expect(page.getByText('Weight Distribution')).toBeVisible()
    await expect(page.getByText('Vector')).toBeVisible()
    await expect(page.getByText('BM25')).toBeVisible()

    await page.goto('/image-embedding')
    await expect(page.getByRole('combobox', { name: 'Model' })).toBeVisible()
    await expect(page.getByText(/Resolution:/)).toBeVisible()
  })

  test('submits text for embedding in simple mode', async ({ page }) => {
    await setServiceModeFromAccount(page, 'simple')
    await page.goto('/text-embedding')

    await page.getByPlaceholder('Enter text to create an embedding...').fill(
      'This is a test text for embedding'
    )
    await page.getByRole('button', { name: 'Create Embedding' }).click()

    // Should show results
    await expect(page.getByText('Model')).toBeVisible()
    await expect(page.getByText('Dimensions')).toBeVisible()
  })
})

test.describe('Hybrid Search', () => {
  test('performs simple search', async ({ page }) => {
    await setServiceModeFromAccount(page, 'simple')
    await page.goto('/search')
    await expect(page.getByText('Weight Distribution')).toHaveCount(0)

    await page.getByPlaceholder('Search embeddings...').fill('test query')
    await page.keyboard.press('Enter')

    // Should show results
    await expect(page.getByText(/Results \(\d+\)/)).toBeVisible()
  })
})
