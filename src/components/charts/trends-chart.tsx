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
import { cn } from '@/lib/utils'
import type { EmbeddingTrend } from '@/lib/schemas/metrics'
import { useTheme } from '@/components/providers/theme-provider'
import { ChartTooltipContent } from './chart-tooltip-content'
import { normalizeEmbeddingTrends } from './trends-chart-utils'
import { buildDeterministicUtcTimeTicks } from './time-axis-ticks'
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
import {
  buildCountAxisFormatter,
  buildTimeTickFormatter,
  buildUtcHourMinuteTickFormatter,
} from './axis-formatters'

interface TrendsChartProps {
  data: EmbeddingTrend[]
  className?: string
  period?: '24h' | '7d' | '30d'
}

const trendSeriesConfig = [
  {
    dataKey: 'Text Embeddings',
    label: 'Text Embeddings',
    tone: 'accent' as ChartTone,
  },
  {
    dataKey: 'Image Embeddings',
    label: 'Image Embeddings',
    tone: 'amber' as ChartTone,
  },
  {
    dataKey: 'Searches',
    label: 'Searches',
    tone: 'teal' as ChartTone,
  },
] as const

export function TrendsChart({ data, className, period = '24h' }: TrendsChartProps) {
  const [chartWidth, setChartWidth] = useState<number>(Number.NaN)
  const [isLineSeriesReady, setIsLineSeriesReady] = useState(false)
  const [areLinesVisible, setAreLinesVisible] = useState(false)
  const latestChartWidthRef = useRef<number>(Number.NaN)
  const previousFrameWidthRef = useRef<number>(Number.NaN)
  const stableWidthFrameCountRef = useRef(0)
  const normalizedChartData = useMemo(() => normalizeEmbeddingTrends(data), [data])
  const chartData = useMemo(
    () => normalizedChartData.filter((point) => Number.isFinite(point.timestamp)),
    [normalizedChartData]
  )
  const timestamps = useMemo(() => chartData.map((point) => point.timestamp), [chartData])
  const tickCadence = period === '24h' ? 'hourly' : 'daily'
  const deterministicTicks = useMemo(
    () => buildDeterministicUtcTimeTicks(timestamps, chartWidth, tickCadence),
    [chartWidth, tickCadence, timestamps]
  )
  const [minTimestamp, maxTimestamp] = useMemo(() => {
    if (!chartData.length) return [Number.NaN, Number.NaN] as const

    const timestamps = chartData.map((point) => point.timestamp)
    return [Math.min(...timestamps), Math.max(...timestamps)] as const
  }, [chartData])
  const xTickFormatter = useMemo(
    () => {
      if (period === '24h') {
        return buildUtcHourMinuteTickFormatter({ locale: 'en-US', timeZone: 'UTC' })
      }

      return buildTimeTickFormatter({
        minTs: minTimestamp,
        maxTs: maxTimestamp,
        locale: 'en-US',
        timeZone: 'UTC',
      })
    },
    [maxTimestamp, minTimestamp, period]
  )
  const countFormatter = useMemo(() => {
    const allSeriesValues = chartData.flatMap((point) =>
      trendSeriesConfig.map((series) => point[series.dataKey])
    )

    return buildCountAxisFormatter(allSeriesValues, 'en-US')
  }, [chartData])
  const { resolvedTheme } = useTheme()

  // Get resolved colors for SVG rendering
  const trendSeries = useMemo(() => {
    return trendSeriesConfig.map((series) => ({
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
    <div className={cn('w-full', chartContainerHeights.tall, className)}>
      <ResponsiveContainer width="100%" height="100%" onResize={handleChartResize}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={chartMargins.lineWideRight}
        >
          <CartesianGrid stroke={chartGridStroke} strokeDasharray={chartGridConfig.strokeDasharray} vertical={chartGridConfig.vertical} />
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
            tickFormatter={(value) => countFormatter.formatTick(Number(value))}
            width="auto"
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const payloadByDataKey = new Map(
                  payload.map((entry) => [String(entry.dataKey), entry])
                )
                const datum = payload[0]?.payload as { timestamp?: number } | undefined

                const rows = trendSeries.flatMap((series) => {
                  const entry = payloadByDataKey.get(series.dataKey)
                  const value = Number(entry?.value)

                  if (!entry || !Number.isFinite(value)) {
                    return []
                  }

                  return [
                    {
                      label: series.label,
                      value: value.toLocaleString(),
                      color: series.color,
                    },
                  ]
                })

                if (!rows.length) return null

                return (
                  <ChartTooltipContent
                    label={Number.isFinite(datum?.timestamp)
                      ? xTickFormatter(Number(datum?.timestamp))
                      : undefined}
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
          {isLineSeriesReady && trendSeries.map((series) => (
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
              dot={chartDotConfig.default}
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
