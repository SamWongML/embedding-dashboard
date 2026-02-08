import { describe, expect, it } from 'vitest'
import { parseSidebarOpenCookie } from '@/lib/layout/sidebar-state'

describe('parseSidebarOpenCookie', () => {
  it('returns false when cookie value is "false"', () => {
    expect(parseSidebarOpenCookie('false')).toBe(false)
  })

  it('returns true when cookie value is "true"', () => {
    expect(parseSidebarOpenCookie('true')).toBe(true)
  })

  it('returns true when cookie is undefined', () => {
    expect(parseSidebarOpenCookie()).toBe(true)
  })

  it('returns true for invalid values', () => {
    expect(parseSidebarOpenCookie('invalid')).toBe(true)
  })
})
