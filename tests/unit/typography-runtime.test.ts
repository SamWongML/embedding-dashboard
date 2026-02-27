import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  parseCssLengthToPx,
  readCssLengthVar,
  readTypographyPxVar,
} from '@/lib/design/typography-runtime'

describe('parseCssLengthToPx', () => {
  it('parses px, rem and unitless values', () => {
    expect(parseCssLengthToPx('12px', 16)).toBe(12)
    expect(parseCssLengthToPx('1.25rem', 16)).toBe(20)
    expect(parseCssLengthToPx('8', 16)).toBe(8)
  })

  it('returns null for unsupported units', () => {
    expect(parseCssLengthToPx('10%', 16)).toBeNull()
  })
})

describe('readCssLengthVar', () => {
  it('reads a generic css variable and falls back when missing', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: (prop: string) => (prop === '--layout-size' ? '18px' : ''),
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    expect(readCssLengthVar('--layout-size', 10)).toBe(18)
    expect(readCssLengthVar('--layout-missing', 10)).toBe(10)
  })
})

describe('readTypographyPxVar', () => {
  let originalWindow: typeof globalThis.window
  let originalDocument: typeof globalThis.document

  beforeEach(() => {
    originalWindow = globalThis.window
    originalDocument = globalThis.document
  })

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.document = originalDocument
  })

  it('returns fallback in SSR environment (window undefined)', () => {
    // @ts-expect-error - intentionally testing undefined
    globalThis.window = undefined
    const result = readTypographyPxVar('--typography-size-base', 16)
    expect(result).toBe(16)
  })

  it('returns fallback in SSR environment (document undefined)', () => {
    // @ts-expect-error - intentionally testing undefined
    globalThis.document = undefined
    const result = readTypographyPxVar('--typography-size-base', 16)
    expect(result).toBe(16)
  })

  it('parses px values correctly', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: (prop: string) => {
        if (prop === '--typography-size-base') return '16px'
        return ''
      },
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 14)
    expect(result).toBe(16)
  })

  it('parses rem values with base conversion', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: (prop: string) => {
        if (prop === '--typography-size-lg') return '1.5rem'
        return ''
      },
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-lg', 20)
    expect(result).toBe(24) // 1.5 * 16 = 24
  })

  it('handles invalid CSS values', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => 'invalid-value',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 14)
    expect(result).toBe(14)
  })

  it('handles missing CSS variables', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-missing', 18)
    expect(result).toBe(18)
  })

  it('handles empty strings', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '   ',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 16)
    expect(result).toBe(16)
  })

  it('handles unitless numeric values', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '20',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 14)
    expect(result).toBe(20)
  })

  it('handles getComputedStyle throwing error', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    globalThis.window.getComputedStyle = vi.fn(() => {
      throw new Error('DOM error')
    }) as unknown as typeof window.getComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 16)
    expect(result).toBe(16)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to read CSS length variable --typography-size-base:',
      expect.any(Error)
    )

    consoleWarnSpy.mockRestore()
  })

  it('uses fallback rem base when fontSize is invalid', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '2rem',
      fontSize: 'invalid',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-base', 14)
    expect(result).toBe(32) // 2 * 16 (fallback) = 32
  })

  it('handles negative values', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '-8px',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-spacing-tight', 0)
    expect(result).toBe(-8)
  })

  it('handles decimal values', () => {
    const mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '14.5px',
      fontSize: '16px',
    })) as unknown as typeof window.getComputedStyle

    globalThis.window.getComputedStyle = mockGetComputedStyle

    const result = readTypographyPxVar('--typography-size-sm', 12)
    expect(result).toBe(14.5)
  })
})
