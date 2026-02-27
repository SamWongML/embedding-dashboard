'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  buildDurationAxisFormatter,
  buildUtcHourMinuteTickFormatter,
} from './axis-formatters'
import { buildDeterministicUtcHourTicks } from './time-axis-ticks'
import {
  chartAnimationDurationMs,
  chartAnimationEasing,
  chartAxisDefaults,
  chartContainerHeights,
  chartDotConfig,
  chartLegendLabelClassName,
  chartLegendPresets,
  chartMargins,
  chartGridConfig,
  chartGridStroke,
  chartLineType,
  chartStrokeWidth,
  chartTooltipCursor,
  getChartColor,
  type ChartTone,
} from './chart-theme'

interface LatencyDistributionChartPoint {
  timestamp: number
  rawTimestamp: string
  label: string
  p50: number | null
  p95: number | null
  p99: number | null
}

interface LatencyDistributionChartProps {
  data: LatencyDistributionChartPoint[]
  className?: string
}

const latencySeriesConfig = [
  {
    dataKey: 'p50',
    label: 'p50',
    tone: 'accent' as ChartTone,
  },
  {
    dataKey: 'p95',
    label: 'p95',
    tone: 'accentSoft' as ChartTone,
  },
  {
    dataKey: 'p99',
    label: 'p99',
    tone: 'error' as ChartTone,
  },
] as const

export function LatencyDistributionChart({ data, className }: LatencyDistributionChartProps) {
  const [chartWidth, setChartWidth] = useState<number>(Number.NaN)
  const [isLineSeriesReady, setIsLineSeriesReady] = useState(false)
  const [areLinesVisible, setAreLinesVisible] = useState(false)
  const latestChartWidthRef = useRef<number>(Number.NaN)
  const previousFrameWidthRef = useRef<number>(Number.NaN)
  const stableWidthFrameCountRef = useRef(0)
  const chartData = useMemo(
    () => data.filter((point) => Number.isFinite(point.timestamp)),
    [data]
  )
  const timestamps = useMemo(() => chartData.map((point) => point.timestamp), [chartData])
  const deterministicTicks = useMemo(
    () => buildDeterministicUtcHourTicks(timestamps, chartWidth),
    [chartWidth, timestamps]
  )
  const xTickFormatter = useMemo(
    () => buildUtcHourMinuteTickFormatter({ locale: 'en-US', timeZone: 'UTC' }),
    []
  )
  const durationFormatter = useMemo(() => {
    const values = chartData.flatMap((point) => {
      const seriesValues = [point.p50, point.p95, point.p99]
      return seriesValues.filter((value): value is number => Number.isFinite(value))
    })
    return buildDurationAxisFormatter(values, 'en-US')
  }, [chartData])
  const { resolvedTheme } = useTheme()
  const latencySeries = useMemo(() => {
    return latencySeriesConfig.map((series) => ({
      ...series,
      color: getChartColor(series.tone, resolvedTheme),
    }))
  }, [resolvedTheme])
  const handleChartResize = useCallback((width: number) => {
    latestChartWidthRef.current = width
    setChartWidth((currentWidth) => (currentWidth === width ? currentWidth : width))
  }, [])

  useEffect(() => {
    latestChartWidthRef.current = chartWidth
  }, [chartWidth])

  useEffect(() => {
    if (isLineSeriesReady || !Number.isFinite(chartWidth)) return

    let rafId: number | null = null
    let cancelled = false

    const verifyStableWidth = () => {
      if (cancelled) return

      const currentWidth = latestChartWidthRef.current

      if (!Number.isFinite(currentWidth)) {
        stableWidthFrameCountRef.current = 0
        previousFrameWidthRef.current = Number.NaN
        rafId = requestAnimationFrame(verifyStableWidth)
        return
      }

      if (Object.is(previousFrameWidthRef.current, currentWidth)) {
        stableWidthFrameCountRef.current += 1
      } else {
        stableWidthFrameCountRef.current = 1
      }

      previousFrameWidthRef.current = currentWidth

      if (stableWidthFrameCountRef.current >= 2) {
        setIsLineSeriesReady(true)
        return
      }

      rafId = requestAnimationFrame(verifyStableWidth)
    }

    rafId = requestAnimationFrame(verifyStableWidth)

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [chartWidth, isLineSeriesReady])

  useEffect(() => {
    if (!isLineSeriesReady || areLinesVisible) return

    let firstFrameId: number | null = null
    let secondFrameId: number | null = null

    firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        setAreLinesVisible(true)
      })
    })

    return () => {
      if (firstFrameId !== null) cancelAnimationFrame(firstFrameId)
      if (secondFrameId !== null) cancelAnimationFrame(secondFrameId)
    }
  }, [areLinesVisible, isLineSeriesReady])

  return (
    <div className={cn('w-full', chartContainerHeights.standard, className)}>
      <ResponsiveContainer width="100%" height="100%" onResize={handleChartResize}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={chartMargins.lineWideRight}
        >
          <CartesianGrid
            stroke={chartGridStroke}
            strokeDasharray={chartGridConfig.strokeDasharray}
            vertical={chartGridConfig.vertical}
          />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={deterministicTicks}
            interval={0}
            {...chartAxisDefaults}
            tickFormatter={(value) => xTickFormatter(Number(value))}
          />
          <YAxis
            {...chartAxisDefaults}
            tickFormatter={(value) => durationFormatter.formatTick(Number(value))}
            width={48}
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const payloadByDataKey = new Map(
                  payload.map((entry) => [String(entry.dataKey), entry])
                )
                const datum = payload[0]?.payload as { label?: string } | undefined
                const rows = latencySeries.flatMap((series) => {
                  const entry = payloadByDataKey.get(series.dataKey)
                  const value = Number(entry?.value)
                  if (!entry || !Number.isFinite(value)) return []

                  return [
                    {
                      label: series.label,
                      value: durationFormatter.formatTooltip(value),
                      color: series.color,
                    },
                  ]
                })

                if (!rows.length) return null

                return (
                  <ChartTooltipContent
                    label={datum?.label}
                    rows={rows}
                  />
                )
              }
              return null
            }}
          />
          <Legend
            {...chartLegendPresets.defaultRight}
            formatter={(value) => (
              <span className={chartLegendLabelClassName}>{value}</span>
            )}
          />
          {isLineSeriesReady && latencySeries.map((series) => (
            <Line
              key={series.dataKey}
              type={chartLineType}
              dataKey={series.dataKey}
              name={series.label}
              stroke={series.color}
              strokeOpacity={areLinesVisible ? 1 : 0}
              strokeWidth={chartStrokeWidth.line}
              isAnimationActive={true}
              animationDuration={chartAnimationDurationMs}
              animationEasing={chartAnimationEasing}
              connectNulls={true}
              dot={false}
              activeDot={{
                r: chartDotConfig.active.r,
                fill: 'var(--card)',
                stroke: series.color,
                strokeWidth: chartDotConfig.active.strokeWidth,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
