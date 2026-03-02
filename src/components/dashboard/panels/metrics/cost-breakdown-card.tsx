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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatUsdCompact,
  formatUsdExact,
} from '@/lib/format/currency-format'
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
    tone: 'pink',
  },
  data_transfer: {
    label: 'Data Transfer',
    tone: 'teal',
  },
}

export function CostBreakdownCard({ items, className }: CostBreakdownCardProps) {
  const [activeCategory, setActiveCategory] = useState<CostBreakdownCategory | null>(null)
  const [isPieHoverActive, setIsPieHoverActive] = useState(false)
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
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="typography-size-base typography-weight-medium">
          Cost Breakdown
        </CardTitle>
        <CardDescription className="typography-size-sm text-muted-foreground">
          Cost split by service category
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-(--chart-height-standard)">
        {!hasCostData ? (
          <div className="flex h-full min-h-(--chart-height-compact) items-center justify-center typography-size-sm text-muted-foreground">
            No cost data is available for this period.
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <div
              data-slot="cost-breakdown-chart"
              className="relative mx-auto aspect-square w-full max-w-[15rem] lg:max-w-[16rem]"
            >
              <ResponsiveContainer width="100%" aspect={1}>
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
                      setIsPieHoverActive(false)
                      setActiveCategory(null)
                    }}
                    onMouseEnter={(_, index) => {
                      setIsPieHoverActive(true)
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
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ zIndex: 'var(--z-tooltip)', pointerEvents: 'none' }}
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
                                value: formatUsdCompact(datum.amountUsd),
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
              <div
                data-slot="cost-breakdown-total"
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-150 ease-out',
                  isPieHoverActive ? 'opacity-0' : 'opacity-100'
                )}
              >
                <span className="typography-size-sm typography-weight-medium tabular-nums text-foreground">
                  {formatUsdCompact(totalCost)}
                </span>
                <span className="typography-size-xs text-muted-foreground">
                  Total
                </span>
              </div>
            </div>

            <ul
              data-slot="cost-breakdown-legend-list"
              className="min-w-0 space-y-[var(--chart-legend-row-gap)] sm:max-h-(--chart-legend-max-height-sm) sm:overflow-y-auto sm:pr-1 lg:max-h-(--chart-legend-max-height-lg)"
              aria-label="Cost breakdown categories"
            >
              {chartData.map((item) => {
                const share = totalCost > 0 ? (item.amountUsd / totalCost) * 100 : 0
                const isActive = activeCategory === item.category

                return (
                  <li key={item.category}>
                    <button
                      type="button"
                      data-slot="cost-breakdown-legend-row"
                      className={cn(
                        'flex min-h-[var(--chart-legend-row-min-height)] w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
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
                      aria-label={`${item.label}: ${formatUsdExact(item.amountUsd)}, ${share.toFixed(1)} percent`}
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
                          {formatUsdCompact(item.amountUsd)}
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
