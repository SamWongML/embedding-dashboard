'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from './chart-tooltip-content'
import {
  chartAnimationDurationMs,
  chartAnimationEasing,
  chartAxisDefaults,
  chartBarFill,
  chartBarRadius,
  chartGridConfig,
  chartGridStroke,
  chartTooltipCursor,
} from './chart-theme'

interface ServiceUsageData {
  endpoint: string
  method: string
  count: number
  avgLatency: number
}

interface ServiceUsageChartProps {
  data: ServiceUsageData[]
  className?: string
}

export function ServiceUsageChart({ data, className }: ServiceUsageChartProps) {
  const chartData = data.map((item) => ({
    name: item.endpoint.replace('/api/', ''),
    count: item.count,
    latency: item.avgLatency,
  }))

  return (
    <div className={cn('w-full h-[200px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={chartGridStroke} strokeDasharray={chartGridConfig.strokeDasharray} vertical={chartGridConfig.vertical} />
          <XAxis
            type="number"
            {...chartAxisDefaults}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            {...chartAxisDefaults}
            width={92}
          />
          <Tooltip
            cursor={chartTooltipCursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const datum = payload[0]?.payload as
                  | { name: string; count: number; latency: number }
                  | undefined
                if (!datum) return null

                return (
                  <ChartTooltipContent
                    label={datum.name}
                    rows={[
                      {
                        label: 'Requests',
                        value: datum.count.toLocaleString(),
                      },
                      {
                        label: 'Avg Latency',
                        value: `${datum.latency}ms`,
                        tone: 'accentSoft',
                      },
                    ]}
                  />
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="count"
            radius={chartBarRadius}
            fill={chartBarFill}
            activeBar={false}
            background={{ fill: 'var(--chart-track)', radius: chartBarRadius[1] }}
            animationDuration={chartAnimationDurationMs}
            animationEasing={chartAnimationEasing}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
