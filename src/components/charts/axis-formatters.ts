export type CountUnit = '' | 'K' | 'M' | 'B' | 'T'
export type DurationUnit = 'ms' | 's' | 'min'

export interface AxisValueFormatter {
  unit: string
  scale: number
  formatTick: (value: number) => string
  formatTooltip: (value: number) => string
}

interface TimeTickFormatterParams {
  minTs: number
  maxTs: number
  locale?: string
  timeZone?: string
}

interface BackendTimeFormatParams {
  locale?: string
  timeZone?: string
}

const THOUSAND = 1_000
const MILLION = 1_000_000
const BILLION = 1_000_000_000
const TRILLION = 1_000_000_000_000

const SECOND_MS = 1_000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function getFiniteAbsMax(values: number[]): number {
  let max = 0

  values.forEach((value) => {
    if (!Number.isFinite(value)) return
    const absValue = Math.abs(value)
    if (absValue > max) {
      max = absValue
    }
  })

  return max
}

function getPrecisionForScaledMax(scaledMax: number): number {
  return scaledMax > 0 && scaledMax < 10 ? 1 : 0
}

function createAxisValueFormatter(
  unit: string,
  scale: number,
  precision: number,
  locale: string
): AxisValueFormatter {
  const numberFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  })

  const formatValue = (value: number) => numberFormatter.format(value / scale)

  return {
    unit,
    scale,
    formatTick(value: number) {
      if (!Number.isFinite(value)) return ''
      return `${formatValue(value)}${unit}`
    },
    formatTooltip(value: number) {
      if (!Number.isFinite(value)) return '-'
      return `${formatValue(value)}${unit}`
    },
  }
}

export function buildCountAxisFormatter(values: number[], locale = 'en-US'): AxisValueFormatter {
  const maxValue = getFiniteAbsMax(values)

  let scale = 1
  let unit: CountUnit = ''

  if (maxValue >= TRILLION) {
    scale = TRILLION
    unit = 'T'
  } else if (maxValue >= BILLION) {
    scale = BILLION
    unit = 'B'
  } else if (maxValue >= MILLION) {
    scale = MILLION
    unit = 'M'
  } else if (maxValue >= THOUSAND) {
    scale = THOUSAND
    unit = 'K'
  }

  const scaledMax = scale === 0 ? 0 : maxValue / scale
  const precision = getPrecisionForScaledMax(scaledMax)

  return createAxisValueFormatter(unit, scale, precision, locale)
}

export function buildDurationAxisFormatter(valuesMs: number[], locale = 'en-US'): AxisValueFormatter {
  const maxValueMs = getFiniteAbsMax(valuesMs)

  let scale = 1
  let unit: DurationUnit = 'ms'

  if (maxValueMs >= MINUTE_MS) {
    scale = MINUTE_MS
    unit = 'min'
  } else if (maxValueMs >= SECOND_MS) {
    scale = SECOND_MS
    unit = 's'
  }

  const scaledMax = scale === 0 ? 0 : maxValueMs / scale
  const precision = getPrecisionForScaledMax(scaledMax)

  return createAxisValueFormatter(unit, scale, precision, locale)
}

export function buildTimeTickFormatter({
  minTs,
  maxTs,
  locale = 'en-US',
  timeZone,
}: TimeTickFormatterParams): (ts: number) => string {
  if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
    return () => ''
  }

  const spanMs = Math.max(0, maxTs - minTs)
  const baseOptions = timeZone ? { timeZone } : {}
  let options: Intl.DateTimeFormatOptions

  if (spanMs <= 2 * HOUR_MS) {
    options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...baseOptions,
    }
  } else if (spanMs <= 2 * DAY_MS) {
    options = {
      hour: 'numeric',
      hour12: true,
      ...baseOptions,
    }
  } else if (spanMs <= 120 * DAY_MS) {
    options = {
      month: 'short',
      day: 'numeric',
      ...baseOptions,
    }
  } else {
    options = {
      month: 'short',
      year: 'numeric',
      ...baseOptions,
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, options)

  return (ts: number): string => {
    if (!Number.isFinite(ts)) return ''
    const date = new Date(ts)
    if (!Number.isFinite(date.getTime())) return ''
    return dateFormatter.format(date)
  }
}

export function formatBackendTimeToHourMinute(
  value: string,
  { locale = 'en-US', timeZone = 'UTC' }: BackendTimeFormatParams = {}
): string {
  const rawValue = value.trim()
  if (!rawValue) return value

  // Keep date-only backend values as-is; hour/minute formatting is for timestamp inputs.
  if (!rawValue.includes('T')) return value

  const timestamp = Date.parse(rawValue)
  if (!Number.isFinite(timestamp)) return value

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(timestamp))
}
