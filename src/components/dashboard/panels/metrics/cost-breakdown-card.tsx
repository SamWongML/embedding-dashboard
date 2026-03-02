'use client'

import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartTooltipContent } from '@/components/charts/chart-tooltip-content'
import {
  chartAnimationDurationMs,
  chartAnimationEasing,
  getChartColor,
  type ChartTone,
} from '@/components/charts/chart-theme'
import { useTheme } from '@/components/providers/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  CostBreakdownCategory,
  CostBreakdownItem,
} from '@/lib/schemas/metrics'
import { COST_BREAKDOWN_CATEGORY_ORDER } from '@/lib/repositories/metrics/cost-breakdown'
import { cn } from '@/lib/utils'

interface CostBreakdownCardProps {
  items: CostBreakdownItem[]
  className?: string
}

type CostBreakdownMeta = {
  label: string
  tone: ChartTone
}

const costBreakdownMetaByCategory: Record<CostBreakdownCategory, CostBreakdownMeta> = {
  embedding_api: {
    label: 'Embedding API',
    tone: 'accent',
  },
  vector_storage: {
    label: 'Vector Storage',
    tone: 'green',
  },
  search_queries: {
    label: 'Search Queries',
    tone: 'amber',
  },
  graph_operations: {
    label: 'Graph Operations',
    tone: 'accentSoft',
  },
  data_transfer: {
    label: 'Data Transfer',
    tone: 'teal',
  },
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function CostBreakdownCard({ items, className }: CostBreakdownCardProps) {
  const [activeCategory, setActiveCategory] = useState<CostBreakdownCategory | null>(null)
  const { resolvedTheme } = useTheme()

  const itemByCategory = useMemo(
    () => new Map(items.map((item) => [item.category, item])),
    [items]
  )
  const chartData = useMemo(
    () =>
      COST_BREAKDOWN_CATEGORY_ORDER.map((category) => {
        const meta = costBreakdownMetaByCategory[category]
        const amountUsd = itemByCategory.get(category)?.amountUsd ?? 0

        return {
          category,
          label: meta.label,
          amountUsd,
          color: getChartColor(meta.tone, resolvedTheme),
        }
      }),
    [itemByCategory, resolvedTheme]
  )
  const totalCost = useMemo(
    () => chartData.reduce((total, item) => total + item.amountUsd, 0),
    [chartData]
  )
  const hasCostData = totalCost > 0

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="typography-size-base typography-weight-medium">
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[250px]">
        {!hasCostData ? (
          <div className="flex h-full min-h-[200px] items-center justify-center typography-size-sm text-muted-foreground">
            No cost data is available for this period.
          </div>
        ) : (
          <div className="grid h-full w-full gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-center">
            <div
              data-slot="cost-breakdown-chart"
              className="mx-auto h-[220px] w-full max-w-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart accessibilityLayer>
                  <Pie
                    data={chartData}
                    dataKey="amountUsd"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={92}
                    minAngle={3}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={chartAnimationDurationMs}
                    animationEasing={chartAnimationEasing}
                    onMouseLeave={() => {
                      setActiveCategory(null)
                    }}
                    onMouseEnter={(_, index) => {
                      const next = chartData[index]
                      setActiveCategory(next?.category ?? null)
                    }}
                  >
                    {chartData.map((item) => (
                      <Cell
                        key={item.category}
                        fill={item.color}
                        stroke="var(--card)"
                        strokeWidth={1}
                        opacity={
                          activeCategory && activeCategory !== item.category ? 0.4 : 1
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null

                      const datum = payload[0]?.payload as
                        | {
                            category: CostBreakdownCategory
                            label: string
                            amountUsd: number
                            color: string
                          }
                        | undefined
                      if (!datum) return null

                      const share = totalCost > 0 ? (datum.amountUsd / totalCost) * 100 : 0
                      return (
                        <div role="status" aria-live="polite">
                          <ChartTooltipContent
                            label={datum.label}
                            rows={[
                              {
                                label: 'Cost',
                                value: formatUsd(datum.amountUsd),
                                color: datum.color,
                              },
                              {
                                label: 'Share',
                                value: `${share.toFixed(1)}%`,
                                tone: 'muted',
                              },
                            ]}
                          />
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-1.5" aria-label="Cost breakdown categories">
              {chartData.map((item) => {
                const share = totalCost > 0 ? (item.amountUsd / totalCost) * 100 : 0
                const isActive = activeCategory === item.category

                return (
                  <li key={item.category}>
                    <button
                      type="button"
                      data-slot="cost-breakdown-legend-row"
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                        isActive ? 'bg-muted/50' : 'hover:bg-muted/40'
                      )}
                      onFocus={() => {
                        setActiveCategory(item.category)
                      }}
                      onBlur={() => {
                        setActiveCategory(null)
                      }}
                      onMouseEnter={() => {
                        setActiveCategory(item.category)
                      }}
                      onMouseLeave={() => {
                        setActiveCategory(null)
                      }}
                      aria-label={`${item.label}: ${formatUsd(item.amountUsd)}, ${share.toFixed(1)} percent`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate typography-size-sm text-muted-foreground">
                          {item.label}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="typography-size-sm typography-weight-medium tabular-nums text-foreground">
                          {formatUsd(item.amountUsd)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

