'use client'

import { cn } from '@/lib/utils'
import { colorByChartTone } from './chart-theme'
import type { ChartTooltipRow } from './chart-theme'

interface ChartTooltipContentProps {
  label?: string
  rows: ChartTooltipRow[]
  className?: string
}

export function ChartTooltipContent({ label, rows, className }: ChartTooltipContentProps) {
  if (!rows.length) return null

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-popover px-2.5 py-2 shadow-md',
        className
      )}
    >
      {label ? <p className="mb-1 typography-micro-11 typography-weight-normal text-muted-foreground tabular-nums">{label}</p> : null}
      <div className="space-y-1.5">
        {rows.map((row) => {
          const indicatorColor = row.color ?? colorByChartTone(row.tone ?? 'accent')

          return (
            <div key={row.label} className="typography-micro-11 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 typography-weight-normal text-muted-foreground">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: indicatorColor }}
                />
                <span>{row.label}</span>
              </div>
              <span className="typography-weight-medium tabular-nums text-foreground">{row.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
