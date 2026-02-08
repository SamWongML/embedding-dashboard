import { expect, test, type ConsoleMessage, type Page } from '@playwright/test'

const HYDRATION_MISMATCH_PATTERN =
  /A tree hydrated but some attributes of the server rendered HTML didn't match the client properties/i
const CONTROLLEDNESS_PATTERN =
  /changing from uncontrolled to controlled|changing from controlled to uncontrolled/i

async function assertNoHydrationWarningsOnReloads({
  page,
  path,
  tabName,
  reloads = 6,
}: {
  page: Page
  path: string
  tabName: string
  reloads?: number
}) {
  const hydrationMessages: string[] = []
  const controllednessMessages: string[] = []

  const onConsole = (message: ConsoleMessage) => {
    const text = message.text()
    if (HYDRATION_MISMATCH_PATTERN.test(text)) {
      hydrationMessages.push(text)
    }
    if (CONTROLLEDNESS_PATTERN.test(text)) {
      controllednessMessages.push(text)
    }
  }

  page.on('console', onConsole)

  try {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('tab', { name: tabName })).toBeVisible()

    for (let index = 0; index < reloads; index += 1) {
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await page.waitForTimeout(700)
    }
  } finally {
    page.off('console', onConsole)
  }

  expect(
    hydrationMessages,
    `Hydration mismatch detected for ${path}:\n${hydrationMessages.join('\n\n')}`
  ).toEqual([])
  expect(
    controllednessMessages,
    `Controlledness warning detected for ${path}:\n${controllednessMessages.join('\n\n')}`
  ).toEqual([])
}

test.describe('Settings hydration stability', () => {
  const testCases = [
    { tabName: 'Account', path: '/settings?tab=account' },
    { tabName: 'Preferences', path: '/settings?tab=preferences' },
    { tabName: 'Security & Access', path: '/settings?tab=security' },
  ]

  for (const testCase of testCases) {
    test(`does not emit hydration warnings after reloads on ${testCase.tabName}`, async ({
      page,
    }) => {
      await assertNoHydrationWarningsOnReloads({
        page,
        path: testCase.path,
        tabName: testCase.tabName,
      })
    })
  }
})
