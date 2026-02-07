import { expect, test } from '@playwright/test'

test.describe('API Mode Feedback', () => {
  test('shows warning when simple search request fails', async ({ page }) => {
    await page.goto('/search')

    await page.getByPlaceholder('Search embeddings...').fill('api mode test query')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Search request failed')).toBeVisible()
    await expect(page.getByText('NEXT_PUBLIC_DEV_API_SCENARIO')).toBeVisible()
  })

  test('shows warning when text embedding request fails', async ({ page }) => {
    await page.goto('/text-embedding')

    await page
      .getByPlaceholder('Enter text to create an embedding...')
      .fill('text embedding api failure test')
    await page.getByRole('button', { name: 'Create Embedding' }).click()

    await expect(page.getByText('Text embedding request failed')).toBeVisible()
  })

  test('shows warning when image embedding request fails', async ({ page }) => {
    await page.goto('/image-embedding')

    await page
      .getByPlaceholder('https://example.com/image.jpg')
      .fill('https://example.com/image.jpg')
    await page.getByRole('button', { name: 'Create Embedding' }).click()

    await expect(page.getByText('Image embedding request failed')).toBeVisible()
  })

  test('shows records query error state with retry action', async ({ page }) => {
    await page.goto('/records')

    await expect(page.getByText('Records unavailable')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('shows warning for non-wired settings actions', async ({ page }) => {
    await page.goto('/settings?tab=account')

    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('Save changes is not wired to backend APIs yet.')
    ).toBeVisible()

    await page.getByRole('tab', { name: 'Security & Access' }).click()
    await page.getByRole('button', { name: 'Sign out all devices' }).click()
    await expect(
      page.getByText('Sign out all devices is not wired to backend APIs yet.')
    ).toBeVisible()
  })
})

