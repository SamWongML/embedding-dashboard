import { describe, expect, it } from 'vitest'
import {
  getSidebarViewportMode,
  SIDEBAR_EXTENDED_MIN_WIDTH,
  SIDEBAR_MEDIUM_MIN_WIDTH,
} from '@/lib/layout/sidebar-mode'

describe('sidebar viewport mode', () => {
  it('maps limited mode below 768px', () => {
    expect(getSidebarViewportMode(SIDEBAR_MEDIUM_MIN_WIDTH - 1)).toBe('limited')
  })

  it('maps medium mode between 768px and 1279px', () => {
    expect(getSidebarViewportMode(SIDEBAR_MEDIUM_MIN_WIDTH)).toBe('medium')
    expect(getSidebarViewportMode(SIDEBAR_EXTENDED_MIN_WIDTH - 1)).toBe('medium')
  })

  it('maps extended mode from 1280px and above', () => {
    expect(getSidebarViewportMode(SIDEBAR_EXTENDED_MIN_WIDTH)).toBe('extended')
    expect(getSidebarViewportMode(SIDEBAR_EXTENDED_MIN_WIDTH + 100)).toBe('extended')
  })
})
