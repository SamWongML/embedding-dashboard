import { describe, expect, it } from 'vitest'
import {
  buildCountAxisFormatter,
  buildDurationAxisFormatter,
  buildTimeTickFormatter,
  formatBackendTimeToHourMinute,
} from '@/components/charts/axis-formatters'

describe('axis-formatters', () => {
  describe('buildCountAxisFormatter', () => {
    it('keeps unitless formatting for small values', () => {
      const formatter = buildCountAxisFormatter([12, 240, 999])

      expect(formatter.unit).toBe('')
      expect(formatter.scale).toBe(1)
      expect(formatter.formatTick(240)).toBe('240')
      expect(formatter.formatTooltip(Number.NaN)).toBe('-')
    })

    it('uses K for thousands and keeps the same unit across ticks', () => {
      const formatter = buildCountAxisFormatter([1_200, 9_800])

      expect(formatter.unit).toBe('K')
      expect(formatter.scale).toBe(1_000)
      expect(formatter.formatTick(1_200)).toBe('1.2K')
      expect(formatter.formatTick(200)).toMatch(/K$/)
      expect(formatter.formatTick(9_800)).toMatch(/K$/)
    })

    it('uses M for millions', () => {
      const formatter = buildCountAxisFormatter([1_500_000, 9_100_000])

      expect(formatter.unit).toBe('M')
      expect(formatter.scale).toBe(1_000_000)
      expect(formatter.formatTick(1_500_000)).toBe('1.5M')
    })
  })

  describe('buildDurationAxisFormatter', () => {
    it('keeps milliseconds for sub-second values', () => {
      const formatter = buildDurationAxisFormatter([120, 800])

      expect(formatter.unit).toBe('ms')
      expect(formatter.scale).toBe(1)
      expect(formatter.formatTick(800)).toBe('800ms')
    })

    it('uses seconds when values are below one minute', () => {
      const formatter = buildDurationAxisFormatter([1_200, 59_000])

      expect(formatter.unit).toBe('s')
      expect(formatter.scale).toBe(1_000)
      expect(formatter.formatTick(1_200)).toBe('1s')
      expect(formatter.formatTooltip(9_000)).toBe('9s')
    })

    it('uses minutes when values are one minute or above', () => {
      const formatter = buildDurationAxisFormatter([60_000, 210_000])

      expect(formatter.unit).toBe('min')
      expect(formatter.scale).toBe(60_000)
      expect(formatter.formatTick(90_000)).toBe('1.5min')
    })
  })

  describe('buildTimeTickFormatter', () => {
    it('uses hour and minute labels for up to two hours', () => {
      const minTs = Date.UTC(2026, 0, 1, 12, 0)
      const maxTs = Date.UTC(2026, 0, 1, 13, 0)
      const formatter = buildTimeTickFormatter({
        minTs,
        maxTs,
        locale: 'en-US',
        timeZone: 'UTC',
      })

      expect(formatter(Date.UTC(2026, 0, 1, 12, 15))).toContain(':')
    })

    it('uses hour-only labels for spans up to two days', () => {
      const minTs = Date.UTC(2026, 0, 1, 0, 0)
      const maxTs = Date.UTC(2026, 0, 2, 0, 0)
      const formatter = buildTimeTickFormatter({
        minTs,
        maxTs,
        locale: 'en-US',
        timeZone: 'UTC',
      })

      expect(formatter(Date.UTC(2026, 0, 1, 15, 0))).not.toContain(':')
    })

    it('uses month and day labels for week-long spans', () => {
      const minTs = Date.UTC(2026, 0, 1)
      const maxTs = Date.UTC(2026, 0, 8)
      const formatter = buildTimeTickFormatter({
        minTs,
        maxTs,
        locale: 'en-US',
        timeZone: 'UTC',
      })

      expect(formatter(Date.UTC(2026, 0, 4))).toMatch(/^[A-Za-z]{3} \d{1,2}$/)
    })

    it('returns empty labels for invalid timestamps', () => {
      const formatter = buildTimeTickFormatter({
        minTs: Date.UTC(2026, 0, 1),
        maxTs: Date.UTC(2026, 0, 2),
      })
      const invalidDomainFormatter = buildTimeTickFormatter({
        minTs: Number.NaN,
        maxTs: Number.NaN,
      })

      expect(formatter(Number.NaN)).toBe('')
      expect(invalidDomainFormatter(Date.UTC(2026, 0, 1))).toBe('')
    })
  })

  describe('formatBackendTimeToHourMinute', () => {
    it('formats backend timestamps into hour and minute', () => {
      const formatted = formatBackendTimeToHourMinute('2026-02-26T14:35:00.000Z', {
        locale: 'en-US',
        timeZone: 'UTC',
      })

      expect(formatted).toContain(':')
    })

    it('keeps date-only values unchanged', () => {
      expect(formatBackendTimeToHourMinute('2026-02-26')).toBe('2026-02-26')
    })

    it('keeps invalid timestamp strings unchanged', () => {
      expect(formatBackendTimeToHourMinute('not-a-timestamp')).toBe('not-a-timestamp')
    })
  })
})
