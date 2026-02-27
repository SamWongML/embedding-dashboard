'use client'

import { cn } from '@/lib/utils'
import { chartTooltipLayout, colorByChartTone } from './chart-theme'
import type { ChartTooltipRow } from './chart-theme'

interface ChartTooltipContentProps {
  label?: string
  rows: ChartTooltipRow[]
  className?: string
  showIndicators?: boolean
}

export function ChartTooltipContent({
  label,
  rows,
  className,
  showIndicators = true,
}: ChartTooltipContentProps) {
  if (!rows.length) return null

  const containerStyle = {
    paddingInline: chartTooltipLayout.paddingX,
    paddingBlock: chartTooltipLayout.paddingY,
  }
  const rowsStyle = { rowGap: chartTooltipLayout.rowGap }

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-popover shadow-md',
        className
      )}
      style={containerStyle}
    >
      {label ? <p className="mb-1 typography-copy-13 typography-weight-normal text-muted-foreground tabular-nums">{label}</p> : null}
      <div className="flex flex-col" style={rowsStyle}>
        {rows.map((row) => {
          const indicatorColor = row.color ?? colorByChartTone(row.tone ?? 'accent')

          return (
            <div key={row.label} className="typography-copy-13 flex items-center justify-between gap-4">
              <div
                className="flex items-center typography-weight-normal text-muted-foreground"
                style={{ columnGap: chartTooltipLayout.rowGap }}
              >
                {showIndicators ? (
                  <span
                    aria-hidden
                    className="shrink-0 rounded-full"
                    style={{
                      backgroundColor: indicatorColor,
                      width: chartTooltipLayout.indicatorSize,
                      height: chartTooltipLayout.indicatorSize,
                    }}
                  />
                ) : null}
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
