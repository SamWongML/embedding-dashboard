import { describe, expect, it } from 'vitest'
import {
  groupNavigationItems,
  navigationGroups,
  navigationItems,
} from '@/components/dashboard/navigation.config'

describe('navigation config', () => {
  it('has unique href values', () => {
    const hrefs = navigationItems.map((item) => item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('groups all items by section without dropping entries', () => {
    const grouped = groupNavigationItems(navigationItems)
    const groupedCount = grouped.reduce((count, group) => count + group.items.length, 0)

    expect(groupedCount).toBe(navigationItems.length)
    expect(grouped).toEqual(navigationGroups)
  })
})
