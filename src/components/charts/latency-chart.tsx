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
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  buildDurationAxisFormatter,
  buildTimeTickFormatter,
  formatBackendTimeToHourMinute,
} from './axis-formatters'
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
} from './chart-theme'

interface LatencyChartProps {
  data: Array<{ timestamp: string; value: number }>
  className?: string
}

export function LatencyChart({ data, className }: LatencyChartProps) {
  const chartData = useMemo(
    () =>
      data
        .map((point) => ({
          rawTimestamp: point.timestamp,
          timestamp: Date.parse(point.timestamp),
          latency: point.value,
        }))
        .filter((point) => Number.isFinite(point.timestamp)),
    [data]
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
  const durationFormatter = useMemo(
    () => buildDurationAxisFormatter(chartData.map((point) => point.latency), 'en-US'),
    [chartData]
  )
  const { resolvedTheme } = useTheme()
  const latencyColor = getChartColor('accent', resolvedTheme)

  return (
    <div className={cn('w-full', chartContainerHeights.compact, className)}>
      <ResponsiveContainer width="100%" height="100%">
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
            tickCount={6}
            {...chartAxisDefaults}
            tickFormatter={(value) => xTickFormatter(Number(value))}
          />
          <YAxis
            {...chartAxisDefaults}
            tickFormatter={(value) => durationFormatter.formatTick(Number(value))}
            width="auto"
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const datum = payload[0]?.payload as { rawTimestamp?: string } | undefined
                if (!datum) return null

                return (
                  <ChartTooltipContent
                    label={datum.rawTimestamp
                      ? formatBackendTimeToHourMinute(datum.rawTimestamp, {
                        locale: 'en-US',
                        timeZone: 'UTC',
                      })
                      : undefined}
                    rows={[
                      {
                        label: 'Latency',
                        value: durationFormatter.formatTooltip(Number(payload[0].value)),
                        color: latencyColor,
                      },
                    ]}
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
          <Line
            type={chartLineType}
            dataKey="latency"
            name="Latency"
            stroke={latencyColor}
            strokeWidth={chartStrokeWidth.line}
            isAnimationActive={true}
            animationDuration={chartAnimationDurationMs}
            animationEasing={chartAnimationEasing}
            dot={chartDotConfig.default}
            activeDot={{
              r: chartDotConfig.active.r,
              fill: 'var(--card)',
              stroke: latencyColor,
              strokeWidth: chartDotConfig.active.strokeWidth,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
