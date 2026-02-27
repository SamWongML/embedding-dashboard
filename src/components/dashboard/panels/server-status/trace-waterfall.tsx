'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChartTooltipContent } from '@/components/charts/chart-tooltip-content'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { TraceSpan, TraceSpansResponse, TraceSummary } from '@/lib/schemas/server-status'

interface TraceWaterfallProps {
  trace: TraceSummary
  detail: TraceSpansResponse
  selectedSpanId?: string | null
  onSelectSpan?: (spanId: string) => void
  scrollMode?: 'default' | 'sheet-mobile'
  className?: string
}

interface SpanLayout {
  leftPercent: number
  widthPercent: number
}

const MIN_SPAN_WIDTH_PERCENT = 1.2

export function computeSpanLayout(
  span: Pick<TraceSpan, 'startMs' | 'durationMs'>,
  traceDurationMs: number
): SpanLayout {
  const safeTraceDuration = Math.max(1, traceDurationMs)
  const leftPercent = Math.max(0, Math.min(100, (span.startMs / safeTraceDuration) * 100))
  const rawWidthPercent = (span.durationMs / safeTraceDuration) * 100
  const widthPercent = Math.max(MIN_SPAN_WIDTH_PERCENT, rawWidthPercent)
  const maxAllowedWidth = Math.max(MIN_SPAN_WIDTH_PERCENT, 100 - leftPercent)

  return {
    leftPercent,
    widthPercent: Math.min(widthPercent, maxAllowedWidth),
  }
}

function formatDurationMs(value: number) {
  return `${Math.round(value).toLocaleString('en-US')}ms`
}

function formatSpanStatus(status: TraceSpan['status']) {
  switch (status) {
    case 'error':
      return 'Error'
    case 'ok':
    default:
      return 'OK'
  }
}

function formatSpanCategory(category: TraceSpan['category']) {
  switch (category) {
    case 'http':
      return 'HTTP'
    case 'middleware':
      return 'Middleware'
    case 'model':
      return 'Model'
    case 'db':
      return 'DB'
    case 'cache':
      return 'Cache'
    case 'queue':
      return 'Queue'
    case 'serialize':
      return 'Serialize'
    case 'other':
    default:
      return 'Other'
  }
}

function getSpanColor(span: TraceSpan) {
  if (span.status === 'error') return 'var(--error)'

  switch (span.category) {
    case 'http':
      return 'var(--chart-accent)'
    case 'middleware':
      return 'oklch(0.62 0.12 300)'
    case 'model':
      return 'var(--chart-4)'
    case 'db':
      return 'var(--chart-2)'
    case 'cache':
      return 'var(--chart-5)'
    case 'queue':
      return 'oklch(0.7 0.08 245)'
    case 'serialize':
      return 'var(--chart-3)'
    case 'other':
    default:
      return 'var(--muted-foreground)'
  }
}

export function TraceWaterfall({
  trace,
  detail,
  selectedSpanId,
  onSelectSpan,
  scrollMode = 'default',
  className,
}: TraceWaterfallProps) {
  const spans = detail.spans

  const selectedSpan = useMemo(
    () => spans.find((span) => span.id === selectedSpanId) ?? null,
    [selectedSpanId, spans]
  )

  if (spans.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border/70 bg-muted/20 p-4', className)}>
        <p className="typography-size-sm text-muted-foreground">No spans available for this trace.</p>
      </div>
    )
  }

  const timeline = (
    <div className="min-w-[30rem] space-y-4">
      <div className="flex items-center justify-between">
        <p className="typography-size-xs text-muted-foreground">0ms</p>
        <p className="typography-size-xs typography-family-mono text-muted-foreground tabular-nums">
          {formatDurationMs(detail.traceDurationMs)}
        </p>
      </div>
      <div className="space-y-2">
        {spans.map((span) => {
          const layout = computeSpanLayout(span, detail.traceDurationMs)
          const isSelected = span.id === selectedSpanId
          const showInlineLabel = layout.widthPercent >= 14

          return (
            <div
              key={span.id}
              className="grid grid-cols-[minmax(6.5rem,8rem)_minmax(20rem,1fr)] items-center gap-2 md:grid-cols-[minmax(9rem,11rem)_1fr] md:gap-3"
            >
              <button
                type="button"
                className={cn(
                  'typography-size-sm truncate rounded-sm px-1 py-0.5 text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-(--ring-width) focus-visible:outline-hidden',
                  isSelected ? 'text-foreground typography-weight-medium' : null
                )}
                onClick={() => onSelectSpan?.(span.id)}
              >
                {span.name}
              </button>
              <div className="relative h-8 overflow-hidden rounded-md border border-border/70 bg-muted/35">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'absolute top-0.5 bottom-0.5 flex items-center rounded-md px-2 text-left typography-size-xs typography-family-mono text-white shadow-sm focus-visible:ring-ring/60 focus-visible:ring-(--ring-width) focus-visible:outline-hidden',
                        isSelected
                          ? 'ring-1 ring-white/50'
                          : 'hover:brightness-105'
                      )}
                      style={{
                        left: `${layout.leftPercent}%`,
                        width: `${layout.widthPercent}%`,
                        backgroundColor: getSpanColor(span),
                      }}
                      onClick={() => onSelectSpan?.(span.id)}
                    >
                      {showInlineLabel ? (
                        <span className="truncate">
                          {span.name} · {formatDurationMs(span.durationMs)}
                        </span>
                      ) : (
                        <span className="truncate">{formatDurationMs(span.durationMs)}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="plain" showArrow={false} side="top" sideOffset={8} className="p-0">
                    <ChartTooltipContent
                      label={span.name}
                      showIndicators={false}
                      rows={[
                        {
                          label: 'Scope',
                          value: `${span.service} · ${formatSpanStatus(span.status)} / ${formatSpanCategory(span.category)}`,
                          tone: span.status === 'error' ? 'error' : 'success',
                        },
                        {
                          label: 'Timing',
                          value: `+${formatDurationMs(span.startMs)} · ${formatDurationMs(span.durationMs)}`,
                          tone: 'accent',
                        },
                      ]}
                    />
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const selectedSpanSummary = selectedSpan ? (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={selectedSpan.status === 'error' ? 'red-subtle' : 'blue-subtle'}>
          {selectedSpan.status.toUpperCase()}
        </Badge>
        <Badge variant="gray-subtle">{selectedSpan.category}</Badge>
        <span className="typography-size-sm typography-weight-medium">{selectedSpan.name}</span>
      </div>
      <p className="mt-2 break-words typography-size-xs text-muted-foreground">
        {selectedSpan.service} · +{formatDurationMs(selectedSpan.startMs)} · {formatDurationMs(selectedSpan.durationMs)}
      </p>
    </div>
  ) : null

  const traceMeta = (
    <p className="typography-size-xs text-muted-foreground">
      Trace {trace.traceId} · {trace.method} {trace.route}
    </p>
  )

  if (scrollMode === 'sheet-mobile') {
    return (
      <div className={cn('min-h-0 flex flex-1 flex-col', className)}>
        <div
          data-slot="trace-waterfall-scroll-region"
          className="min-h-0 flex-1 overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable_both-edges]"
        >
          <div className="space-y-4">
            {timeline}
            {selectedSpanSummary}
            {traceMeta}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="overflow-x-auto">
        {timeline}
      </div>
      {selectedSpanSummary}
      {traceMeta}
    </div>
  )
}
