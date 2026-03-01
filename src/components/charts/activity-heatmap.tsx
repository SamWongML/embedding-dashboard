'use client'

import { Fragment, useMemo, type CSSProperties } from 'react'
import type { SearchAnalytics } from '@/lib/schemas/metrics'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  buildActivityHeatmapRows,
  buildHeatmapLegend,
  buildHeatmapScale,
  type ActivityHeatmapPeriod,
  type ActivityHeatmapRowRange,
} from './activity-heatmap-utils'

interface ActivityHeatmapProps {
  data: SearchAnalytics[]
  period: ActivityHeatmapPeriod
  visibleRowRange?: ActivityHeatmapRowRange
  className?: string
}

const REQUEST_COUNT_FORMATTER = new Intl.NumberFormat('en-US')
const HEATMAP_TICK_HOURS = new Set([0, 6, 12, 18])
const GRID_HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const HEATMAP_GRID_STYLE = {
  gridTemplateColumns: 'var(--heatmap-label-width) repeat(24, var(--heatmap-cell-size))',
  columnGap: 'var(--heatmap-cell-gap)',
  rowGap: 'var(--heatmap-cell-gap)',
  width: '100%',
} as const
const HEATMAP_LAYOUT_STYLE = {
  '--heatmap-cell-size':
    'clamp(var(--heatmap-cell-min-size), calc((100% - var(--heatmap-label-width) - (24 * var(--heatmap-cell-gap))) / 24), var(--heatmap-cell-max-size))',
} as CSSProperties
const HEATMAP_LEGEND_SWATCH_STYLE = {
  width: 'var(--heatmap-cell-min-size)',
  height: 'var(--heatmap-cell-min-size)',
} as const

function periodDescription(period: ActivityHeatmapPeriod) {
  if (period === '24h') return 'Last 24 hours in UTC'
  if (period === '7d') return 'Last 7 days in UTC'
  return 'Last 30 days in UTC'
}

export function ActivityHeatmap({ data, period, visibleRowRange, className }: ActivityHeatmapProps) {
  const counts = useMemo(
    () =>
      data.map((point) => (Number.isFinite(point.count) ? Math.max(0, point.count) : 0)),
    [data]
  )
  const scale = useMemo(() => buildHeatmapScale(counts), [counts])
  const rows = useMemo(() => buildActivityHeatmapRows(data, period, scale), [data, period, scale])
  const visibleRows = useMemo(() => {
    if (!visibleRowRange) {
      return rows
    }

    const start = Math.max(0, Math.trunc(visibleRowRange.start))
    const end = Math.min(rows.length, Math.max(start, Math.trunc(visibleRowRange.end)))
    const slicedRows = rows.slice(start, end)
    return slicedRows.length > 0 ? slicedRows : rows
  }, [rows, visibleRowRange])
  const legend = useMemo(() => buildHeatmapLegend(scale), [scale])

  if (!visibleRows.length) {
    return (
      <div className="flex h-(--chart-height-tall) items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center typography-copy-13 text-muted-foreground">
        No activity data is available for this period.
      </div>
    )
  }

  return (
    <div className={cn('flex h-full min-h-(--chart-height-tall) w-full flex-col', className)}>
      <div className="flex-1 overflow-x-auto pb-1">
        <div
          data-slot="activity-heatmap-grid"
          className="min-w-(--heatmap-grid-min-width)"
          style={HEATMAP_LAYOUT_STYLE}
        >
          <div className="grid items-center" style={HEATMAP_GRID_STYLE}>
            <span aria-hidden />
            {GRID_HOURS.map((hour) => (
              <span
                key={`tick-${hour}`}
                className="typography-size-xs text-muted-foreground text-center tabular-nums"
              >
                {HEATMAP_TICK_HOURS.has(hour) ? String(hour).padStart(2, '0') : ''}
              </span>
            ))}

            {visibleRows.map((row) => (
              <Fragment key={row.id}>
                <span className="typography-copy-13 pr-1 text-muted-foreground">
                  {row.label}
                </span>
                {row.cells.map((cell) => (
                  <Tooltip key={cell.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        data-slot="activity-heatmap-cell"
                        data-level={cell.level}
                        aria-current={cell.isToday ? 'date' : undefined}
                        aria-label={`${cell.isToday ? 'Today' : cell.dateLabel} ${cell.hourLabel} UTC: ${REQUEST_COUNT_FORMATTER.format(cell.count)} requests`}
                        className="h-auto w-full aspect-square rounded-[calc(var(--radius-sm)-1px)] border transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-110 hover:saturate-125 focus-visible:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
                        style={{
                          backgroundColor: `var(--heatmap-level-${cell.level})`,
                          borderColor: 'var(--heatmap-cell-border)',
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent variant="surface" side="top" sideOffset={6} showArrow={false}>
                      <div className="flex flex-col gap-0.5">
                        <span className="typography-copy-13 text-muted-foreground tabular-nums">
                          {cell.isToday ? 'Today' : cell.dateLabel} · {cell.hourLabel} UTC
                        </span>
                        <span className="typography-copy-13 typography-weight-medium tabular-nums text-foreground">
                          {REQUEST_COUNT_FORMATTER.format(cell.count)} requests
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div
        data-slot="activity-heatmap-footer"
        className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3"
      >
        <p className="typography-copy-13 text-muted-foreground">{periodDescription(period)}</p>
        <div className="flex items-center gap-2">
          <span className="typography-size-xs text-muted-foreground">Less</span>
          <div className="flex items-center gap-(--heatmap-cell-gap)" aria-label="Activity heatmap legend">
            {legend.map((bin) => (
              <span
                key={`legend-${bin.level}`}
                data-slot="activity-heatmap-legend-swatch"
                title={bin.label}
                className="rounded-[calc(var(--radius-sm)-1px)] border"
                style={{
                  ...HEATMAP_LEGEND_SWATCH_STYLE,
                  backgroundColor: `var(--heatmap-level-${bin.level})`,
                  borderColor: 'var(--heatmap-cell-border)',
                }}
              />
            ))}
          </div>
          <span className="typography-size-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  )
}
