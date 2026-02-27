'use client'

import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from './chart-tooltip-content'
import { buildCountAxisFormatter } from './axis-formatters'
import {
  chartAnimationDurationMs,
  chartAnimationEasing,
  chartAxisDefaults,
  chartContainerHeights,
  chartLegendLabelClassName,
  chartLegendPresets,
  chartMargins,
  chartGridConfig,
  chartGridStroke,
  chartTooltipCursor,
  getChartColor,
} from './chart-theme'

interface ThroughputErrorsChartPoint {
  timestamp: number
  label: string
  requests: number
  errors: number
}

interface ThroughputErrorsChartProps {
  data: ThroughputErrorsChartPoint[]
  className?: string
}

export function ThroughputErrorsChart({ data, className }: ThroughputErrorsChartProps) {
  const chartData = useMemo(() => {
    return data.filter((point) => Number.isFinite(point.timestamp))
  }, [data])
  const countFormatter = useMemo(() => {
    const values = chartData.flatMap((point) => [point.requests, point.errors])
    return buildCountAxisFormatter(values, 'en-US')
  }, [chartData])
  const { resolvedTheme } = useTheme()
  const requestsColor = getChartColor('accent', resolvedTheme)
  const errorsColor = getChartColor('error', resolvedTheme)

  return (
    <div className={cn('w-full', chartContainerHeights.standard, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          accessibilityLayer
          data={chartData}
          margin={chartMargins.composedDefault}
          barCategoryGap="18%"
        >
          <CartesianGrid
            stroke={chartGridStroke}
            strokeDasharray={chartGridConfig.strokeDasharray}
            vertical={chartGridConfig.vertical}
          />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(value, index) => (index % 4 === 0 ? String(value) : '')}
            {...chartAxisDefaults}
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
                const datum = payload[0]?.payload as
                  | { label?: string; requests?: number; errors?: number }
                  | undefined
                if (!datum) return null

                return (
                  <ChartTooltipContent
                    label={datum.label}
                    rows={[
                      {
                        label: 'Requests',
                        value: countFormatter.formatTooltip(Number(datum.requests)),
                        color: requestsColor,
                      },
                      {
                        label: 'Errors',
                        value: countFormatter.formatTooltip(Number(datum.errors)),
                        color: errorsColor,
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
          <Bar
            dataKey="requests"
            name="Requests"
            fill={requestsColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
            isAnimationActive={true}
            animationDuration={chartAnimationDurationMs}
            animationEasing={chartAnimationEasing}
          />
          <Bar
            dataKey="errors"
            name="Errors"
            fill={errorsColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={6}
            isAnimationActive={true}
            animationDuration={chartAnimationDurationMs}
            animationEasing={chartAnimationEasing}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
