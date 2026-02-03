import { test, expect } from '@playwright/test'

test.describe('Text Embedding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/text-embedding')
  })

  test('shows simple mode by default', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Simple' })).toHaveAttribute(
      'data-state',
      'active'
    )
  })

  test('switches to technical mode', async ({ page }) => {
    await page.getByRole('tab', { name: 'Technical' }).click()
    await expect(page.getByRole('tab', { name: 'Technical' })).toHaveAttribute(
      'data-state',
      'active'
    )
    // Technical mode should show model selector
    await expect(page.getByText('Model')).toBeVisible()
    await expect(page.getByText('Chunk Size')).toBeVisible()
  })

  test('submits text for embedding in simple mode', async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
  })

  test('performs simple search', async ({ page }) => {
    await page.getByPlaceholder('Search embeddings...').fill('test query')
    await page.getByRole('button').filter({ has: page.locator('svg') }).click()

    // Should show results
    await expect(page.getByText('Results')).toBeVisible()
  })

  test('technical mode shows weight sliders', async ({ page }) => {
    await page.getByRole('tab', { name: 'Technical' }).click()

    await expect(page.getByText('Vector')).toBeVisible()
    await expect(page.getByText('BM25')).toBeVisible()
    await expect(page.getByText('Graph')).toBeVisible()
  })
})
