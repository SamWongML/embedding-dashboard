import { test, expect, type Page } from '@playwright/test'

async function setServiceModeFromAccount(page: Page, mode: 'simple' | 'technical') {
  await page.goto('/settings?tab=account')
  const label = mode === 'simple' ? 'Simple' : 'Technical'
  const radio = page.getByRole('radio', { name: new RegExp(`^${label}`, 'i') })
  await radio.check()
  await expect(radio).toBeChecked()
}

function getQueueItemByText(page: Page, text: string) {
  return page
    .locator('[data-testid^="embedding-queue-item-"]')
    .filter({ hasText: text })
    .first()
}

test.describe('Text Embedding', () => {
  test('shows simple mode by default', async ({ page }) => {
    await page.goto('/text-embedding')
    await expect(page.getByText('Advanced Parameters')).toHaveCount(0)
  })

  test('filters queue by status metric and syncs filter state to URL', async ({ page }) => {
    await setServiceModeFromAccount(page, 'simple')
    await page.goto('/text-embedding')

    const processingFilterMetric = page.getByTestId('embedding-queue-metric-processing')
    await expect(processingFilterMetric).toBeVisible()

    await processingFilterMetric.click()
    await expect(page).toHaveURL(/queueStatus=processing/)

    const queueRows = page.locator('[data-testid^="embedding-queue-item-"]')
    const rowCount = await queueRows.count()
    expect(rowCount).toBeGreaterThan(0)

    for (let index = 0; index < rowCount; index += 1) {
      await expect(
        queueRows.nth(index).locator('[data-testid^="embedding-queue-status-"]')
      ).toContainText('Processing')
    }

    await processingFilterMetric.click()
    await expect(page).not.toHaveURL(/queueStatus=processing/)
    const restoredRowCount = await queueRows.count()
    expect(restoredRowCount).toBeGreaterThan(1)
  })

  test('applies technical mode from account settings across services', async ({ page }) => {
    await setServiceModeFromAccount(page, 'technical')

    await page.goto('/text-embedding')
    await expect(page.getByText('Chunk Size')).toBeVisible()
    await expect(page.getByText('Advanced Parameters')).toBeVisible()

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

    await page.getByPlaceholder('Paste or type your text content here...').fill(
      'Queue demo text for embedding'
    )
    await page.getByRole('button', { name: 'Generate Embedding' }).click()

    await expect(page.getByText('Embedding Queue')).toBeVisible()
    const submittedQueueItem = getQueueItemByText(page, 'Queue demo text for embedding')
    await expect(submittedQueueItem).toBeVisible({ timeout: 15000 })
    await expect(submittedQueueItem).toContainText('TXT')
    await expect(submittedQueueItem).toContainText(/Queued|Processing|Completed|Failed/)
    await submittedQueueItem.click()

    await expect(page.getByText('Embedding Result')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy Full Vector' })).toBeVisible({
      timeout: 30000,
    })
  })

  test('queues URL embedding in simple mode', async ({ page }) => {
    await setServiceModeFromAccount(page, 'simple')
    await page.goto('/text-embedding')

    await page.getByRole('tab', { name: 'URL Content' }).click()
    await page
      .getByPlaceholder('https://example.com/article')
      .fill('https://example.com/docs/embedding')
    await page.getByRole('button', { name: 'Generate Embedding' }).click()

    const submittedQueueItem = getQueueItemByText(
      page,
      'https://example.com/docs/embedding'
    )
    await expect(submittedQueueItem).toBeVisible({ timeout: 15000 })
    await expect(submittedQueueItem).toContainText('URL')
    await expect(submittedQueueItem).toContainText(/Queued|Processing|Completed|Failed/)
  })

  test('queues technical embedding with advanced options', async ({ page }) => {
    await setServiceModeFromAccount(page, 'technical')
    await page.goto('/text-embedding')
    await expect(page.getByText('Advanced Parameters')).toBeVisible()

    await page
      .getByPlaceholder('Paste or type your text content here...')
      .fill('Technical mode embedding request for queue detail validation')
    await page
      .getByPlaceholder('{"source": "manual", "tags": ["demo"]}')
      .fill('{"source":"e2e","mode":"technical"}')
    await page.getByRole('button', { name: 'Generate Embedding' }).click()

    await expect(page.getByText('Embedding Queue')).toBeVisible()
    const submittedQueueItem = getQueueItemByText(
      page,
      'Technical mode embedding request for queue detail validation'
    )
    await expect(submittedQueueItem).toBeVisible({ timeout: 30000 })
    await expect(submittedQueueItem).toContainText('TXT')
    await expect(submittedQueueItem).toContainText(/Queued|Processing|Completed|Failed/)
    await submittedQueueItem.click()
    await expect(page.getByRole('button', { name: 'Copy Full Vector' })).toBeVisible({
      timeout: 30000,
    })
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
