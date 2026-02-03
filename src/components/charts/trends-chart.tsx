'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { EmbeddingTrend } from '@/lib/schemas/metrics'

interface TrendsChartProps {
  data: EmbeddingTrend[]
  className?: string
}

export function TrendsChart({ data, className }: TrendsChartProps) {
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    'Text Embeddings': point.textEmbeddings,
    'Image Embeddings': point.imageEmbeddings,
    Searches: point.searches,
  }))

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="textGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(60% 0.18 260)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(60% 0.18 260)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="imageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(65% 0.15 185)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(65% 0.15 185)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(70% 0.16 80)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(70% 0.16 80)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'oklch(50% 0.01 240)' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-lg">
                    <p className="text-xs font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        {entry.name}: {(entry.value as number).toLocaleString()}
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="Text Embeddings"
            stroke="oklch(60% 0.18 260)"
            strokeWidth={2}
            fill="url(#textGradient)"
          />
          <Area
            type="monotone"
            dataKey="Image Embeddings"
            stroke="oklch(65% 0.15 185)"
            strokeWidth={2}
            fill="url(#imageGradient)"
          />
          <Area
            type="monotone"
            dataKey="Searches"
            stroke="oklch(70% 0.16 80)"
            strokeWidth={2}
            fill="url(#searchGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
