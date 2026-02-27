'use client'

import { useMemo } from 'react'
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
  formatBackendTimeToHourMinute,
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
    tone: 'accent' as ChartTone,      // Blue (chart-1)
  },
  {
    dataKey: 'Image Embeddings',
    label: 'Image Embeddings',
    tone: 'accentSoft' as ChartTone,  // Accent soft
  },
  {
    dataKey: 'Searches',
    label: 'Searches',
    tone: 'accentDim' as ChartTone,   // Accent dim
  },
] as const

export function TrendsChart({ data, className }: TrendsChartProps) {
  const normalizedChartData = useMemo(() => normalizeEmbeddingTrends(data), [data])
  const chartData = useMemo(
    () => normalizedChartData.filter((point) => Number.isFinite(point.timestamp)),
    [normalizedChartData]
  )
  const [minTimestamp, maxTimestamp] = useMemo(() => {
    if (!chartData.length) return [Number.NaN, Number.NaN] as const

    const timestamps = chartData.map((point) => point.timestamp)
    return [Math.min(...timestamps), Math.max(...timestamps)] as const
  }, [chartData])
  const xTickFormatter = useMemo(
    () =>
      buildTimeTickFormatter({
        minTs: minTimestamp,
        maxTs: maxTimestamp,
        locale: 'en-US',
        timeZone: 'UTC',
      }),
    [maxTimestamp, minTimestamp]
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

  return (
    <div className={cn('w-full', chartContainerHeights.tall, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={chartMargins.lineDefault}
        >
          <CartesianGrid stroke={chartGridStroke} strokeDasharray={chartGridConfig.strokeDasharray} vertical={chartGridConfig.vertical} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickCount={6}
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
                const datum = payload[0]?.payload as { date?: string } | undefined

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
                    label={datum?.date
                      ? formatBackendTimeToHourMinute(datum.date, {
                        locale: 'en-US',
                        timeZone: 'UTC',
                      })
                      : undefined}
                    rows={rows}
                  />
                )
              }
              return null
            }}
          />
          <Legend
            {...chartLegendPresets.roomyTop}
            formatter={(value) => (
              <span className={chartLegendLabelClassName}>{value}</span>
            )}
          />
          {trendSeries.map((series) => (
            <Line
              key={series.dataKey}
              type={chartLineType}
              dataKey={series.dataKey}
              name={series.label}
              stroke={series.color}
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
