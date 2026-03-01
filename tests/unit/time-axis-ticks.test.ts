import { describe, expect, it } from 'vitest'
import {
  buildDeterministicUtcDayTicks,
  buildDeterministicUtcHourTicks,
  buildDeterministicUtcTimeTicks,
  getDailyTickStep,
  getHourlyTickStep,
  getTimeTickStep,
} from '@/components/charts/time-axis-ticks'

const HOUR_MS = 60 * 60 * 1000

function buildHourlyTimestamps(pointCount = 24) {
  const start = Date.UTC(2026, 1, 26, 0, 0, 0, 0)
  return Array.from({ length: pointCount }, (_, index) => start + index * HOUR_MS)
}

describe('time-axis-ticks', () => {
  it('returns deterministic ticks for hourly and daily cadences', () => {
    const timestamps = buildHourlyTimestamps(24)

    const hourlyTicks = buildDeterministicUtcTimeTicks(timestamps, 920, 'hourly')
    const dailyTicks = buildDeterministicUtcTimeTicks(timestamps, 920, 'daily')

    expect(hourlyTicks.length).toBeGreaterThan(1)
    expect(dailyTicks.length).toBeGreaterThan(0)
    expect(hourlyTicks[hourlyTicks.length - 1]).toBe(timestamps[timestamps.length - 1])
    expect(dailyTicks[dailyTicks.length - 1]).toBe(timestamps[timestamps.length - 1])
  })

  it('returns deterministic ticks with a uniform step and preserves the latest hour', () => {
    const timestamps = buildHourlyTimestamps(24)
    const ticks = buildDeterministicUtcHourTicks(timestamps, 920)

    expect(ticks.length).toBeGreaterThan(1)
    expect(ticks[ticks.length - 1]).toBe(timestamps[timestamps.length - 1])

    const diffs = ticks.slice(1).map((tick, index) => tick - ticks[index]!)
    expect(new Set(diffs).size).toBe(1)
    expect((diffs[0] ?? 0) % HOUR_MS).toBe(0)
  })

  it('uses denser ticks on wider charts and sparser ticks on narrower charts', () => {
    const wideStep = getHourlyTickStep(24, 1400)
    const narrowStep = getHourlyTickStep(24, 500)

    expect(wideStep).toBeLessThan(narrowStep)
  })

  it('uses independent daily step rules', () => {
    const wideStep = getDailyTickStep(30, 1400)
    const narrowStep = getDailyTickStep(30, 500)

    expect(wideStep).toBeLessThan(narrowStep)
    expect(getTimeTickStep(30, 920, 'daily')).toBe(getDailyTickStep(30, 920))
  })

  it('falls back to a safe default step for invalid widths', () => {
    expect(getHourlyTickStep(24, Number.NaN)).toBe(4)
    expect(getHourlyTickStep(24, 0)).toBe(4)
    expect(getDailyTickStep(30, Number.NaN)).toBe(4)
    expect(getDailyTickStep(30, 0)).toBe(4)
  })

  it('ignores invalid timestamps and returns empty output for empty input', () => {
    const timestamps = buildHourlyTimestamps(3)
    const ticks = buildDeterministicUtcHourTicks(
      [Number.NaN, timestamps[0]!, Number.POSITIVE_INFINITY, timestamps[2]!],
      1000
    )

    expect(ticks).toEqual([timestamps[0], timestamps[2]])
    expect(buildDeterministicUtcDayTicks([timestamps[0]!, timestamps[2]!], 920)).toEqual([
      timestamps[0],
      timestamps[2],
    ])
    expect(buildDeterministicUtcHourTicks([], 800)).toEqual([])
  })
})
