'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { cn } from '@/lib/utils'
import type { TopHit } from '@/lib/schemas/metrics'

interface TopHitsChartProps {
  data: TopHit[]
  className?: string
}

const colors = [
  'oklch(60% 0.18 260)',
  'oklch(62% 0.17 260)',
  'oklch(64% 0.16 260)',
  'oklch(66% 0.15 260)',
  'oklch(68% 0.14 260)',
]

export function TopHitsChart({ data, className }: TopHitsChartProps) {
  return (
    <div className={cn('w-full h-[200px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
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
            width={120}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Hits: {data.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type: {data.type}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
