'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { cn } from '@/lib/utils'

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

const colors = [
  'oklch(60% 0.18 260)',
  'oklch(65% 0.15 185)',
  'oklch(55% 0.12 150)',
  'oklch(70% 0.16 80)',
  'oklch(58% 0.14 45)',
]

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
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Requests: {data.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg Latency: {data.latency}ms
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
