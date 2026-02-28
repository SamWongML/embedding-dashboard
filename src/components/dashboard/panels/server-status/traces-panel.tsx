'use client'

import { useDeferredValue, useMemo, useRef, useState } from 'react'
import { ApiError } from '@/lib/api'
import { useDelayedSheetSelection } from '@/lib/hooks/use-delayed-sheet-selection'
import { useRecentTraces, useTraceSpans } from '@/lib/hooks/use-server-status'
import { isApiDataMode } from '@/lib/runtime/data-mode'
import type { ErrorLog, TraceSummary } from '@/lib/schemas/server-status'
import { matchesTraceSearch, parseTraceSearchQuery } from '@/lib/traces/trace-search'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronRight, CircleCheck, CircleX, Search, X } from 'lucide-react'
import { TraceWaterfall } from './trace-waterfall'
import { TraceWaterfallLoading } from './trace-waterfall-loading'

interface TracesPanelProps {
  legacyErrors: ErrorLog[]
  className?: string
}

interface SelectedSpanState {
  traceId: string
  spanId: string
}

function formatTraceTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuration(durationMs: number) {
  return `${Math.round(durationMs).toLocaleString('en-US')}ms`
}

function formatErrorTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function StatusIcon({ status }: { status: TraceSummary['status'] }) {
  if (status === 'error') {
    return <CircleX className="size-(--icon-sm) text-error" aria-hidden />
  }

  return <CircleCheck className="size-(--icon-sm) text-success" aria-hidden />
}

function LegacyLogsFallback({ errors }: { errors: ErrorLog[] }) {
  const fallbackErrors = errors.slice(0, 10)

  return (
    <div className="space-y-4 px-(--card-padding) pb-(--card-padding)">
      <ActionWarningState
        variant="warning"
        title="Traces endpoint unavailable"
        description="The trace API returned 404. Showing legacy recent logs as a temporary fallback."
      />
      <div className="overflow-hidden rounded-lg border border-border/70">
        <div className="border-b border-border/70 bg-muted/30 px-4 py-2">
          <p className="typography-size-sm typography-weight-medium">Recent Logs</p>
        </div>
        {fallbackErrors.length === 0 ? (
          <p className="px-4 py-6 typography-size-sm text-muted-foreground">No recent logs.</p>
        ) : (
          <div className="divide-y divide-border/70">
            {fallbackErrors.map((error) => (
              <div key={error.id} className="px-4 py-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <Badge variant={error.level === 'error' ? 'red-subtle' : 'gray-subtle'}>
                    {error.level}
                  </Badge>
                  <span className="typography-size-xs text-muted-foreground">
                    {formatErrorTime(error.timestamp)}
                  </span>
                </div>
                <p className="typography-size-sm text-foreground">{error.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TracesPanel({ legacyErrors, className }: TracesPanelProps) {
  const isMobile = useIsMobile()
  const inspectorHeadingRef = useRef<HTMLHeadingElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTracePreference, setSelectedTracePreference] = useState<string | null>(null)
  const [selectedSpanState, setSelectedSpanState] = useState<SelectedSpanState | null>(null)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const {
    open: isMobileDetailsOpen,
    selectedValue: mobileSheetTraceId,
    selectValue: openMobileDetails,
    onOpenChange: onMobileDetailsOpenChange,
    onSheetAnimationEnd: onMobileDetailsAnimationEnd,
  } = useDelayedSheetSelection<string>()

  const parsedSearchQuery = useMemo(
    () => parseTraceSearchQuery(deferredSearchQuery),
    [deferredSearchQuery]
  )

  const tracesQuery = useRecentTraces({
    status: 'all',
    service: 'all',
    query: '',
    limit: 100,
  })

  const allTraces = useMemo(() => tracesQuery.data ?? [], [tracesQuery.data])

  const localeTimeByTraceId = useMemo(
    () =>
      new Map(
        allTraces.map((trace) => [trace.traceId, formatTraceTime(trace.timestamp)] as const)
      ),
    [allTraces]
  )

  const traces = useMemo(
    () =>
      allTraces.filter((trace) =>
        matchesTraceSearch(
          trace,
          parsedSearchQuery,
          localeTimeByTraceId.get(trace.traceId) ?? ''
        )
      ),
    [allTraces, localeTimeByTraceId, parsedSearchQuery]
  )

  const selectedTraceId = useMemo(() => {
    if (!traces.length) return null
    if (
      selectedTracePreference &&
      traces.some((trace) => trace.traceId === selectedTracePreference)
    ) {
      return selectedTracePreference
    }
    return traces[0]?.traceId ?? null
  }, [selectedTracePreference, traces])

  const selectedTrace = useMemo(
    () => traces.find((trace) => trace.traceId === selectedTraceId) ?? null,
    [selectedTraceId, traces]
  )

  const activeTrace = selectedTrace
  const selectedSpanIdForActiveTrace =
    selectedSpanState && selectedSpanState.traceId === activeTrace?.traceId
      ? selectedSpanState.spanId
      : null
  const traceSpansQuery = useTraceSpans(mobileSheetTraceId ?? activeTrace?.traceId ?? null)

  const tracesError = tracesQuery.error
  const tracesApiError = tracesError instanceof ApiError ? tracesError : null
  const tracesMissingEndpoint = tracesApiError?.status === 404
  const showLegacyFallback =
    isApiDataMode() &&
    tracesQuery.isError &&
    !tracesQuery.data &&
    tracesMissingEndpoint

  const listWarning =
    tracesQuery.isError && tracesQuery.data
      ? tracesError instanceof Error
        ? tracesError.message
        : 'Unable to refresh recent traces from API.'
      : null

  const isTraceListLoading = tracesQuery.isLoading && !tracesQuery.data
  const isWaterfallLoading = isTraceListLoading || Boolean(activeTrace && traceSpansQuery.isLoading)
  const hasTraceListFailure = tracesQuery.isError && !tracesQuery.data && !showLegacyFallback
  const searchHint = 'Try status:error, service:graph, duration:>1s, spans:>=10'
  const traceResultsLabel = `${traces.length} of ${allTraces.length} traces`
  const emptyListMessage = searchQuery.trim()
    ? 'No traces match this search. Try different terms or token filters.'
    : 'No recent traces available.'

  const handleSelectTrace = (trace: TraceSummary) => {
    setSelectedTracePreference(trace.traceId)
    setSelectedSpanState(null)
    if (isMobile) {
      openMobileDetails(trace.traceId)
    }
  }

  const handleTableKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isMobile) return
    if (!traces.length) return

    const key = event.key.toLowerCase()
    const currentIndex = Math.max(
      0,
      traces.findIndex((trace) => trace.traceId === selectedTraceId)
    )

    if (event.key === 'ArrowDown' || key === 'j') {
      event.preventDefault()
      const nextIndex = (currentIndex + 1) % traces.length
      const nextTrace = traces[nextIndex]
      if (nextTrace) {
        setSelectedTracePreference(nextTrace.traceId)
        setSelectedSpanState(null)
      }
      return
    }

    if (event.key === 'ArrowUp' || key === 'k') {
      event.preventDefault()
      const nextIndex = (currentIndex - 1 + traces.length) % traces.length
      const nextTrace = traces[nextIndex]
      if (nextTrace) {
        setSelectedTracePreference(nextTrace.traceId)
        setSelectedSpanState(null)
      }
      return
    }

    if (event.key === 'Enter' && selectedTraceId) {
      event.preventDefault()
      if (isMobile) {
        openMobileDetails(selectedTraceId)
      } else {
        inspectorHeadingRef.current?.focus()
      }
    }
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="typography-size-base typography-weight-medium">Recent Traces</CardTitle>
            <CardDescription className="typography-size-sm text-muted-foreground">
              Select a trace to inspect span waterfall
            </CardDescription>
          </div>
          <div className="w-full space-y-1.5 md:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-(--icon-sm) -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search traces…"
                className="pl-8 pr-8"
                aria-label="Search traces"
              />
              {searchQuery ? (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear trace search"
                >
                  <X className="size-(--icon-xs)" />
                </Button>
              ) : null}
            </div>
            <div className="flex flex-col gap-1 typography-size-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p>{searchHint}</p>
              <p className="typography-family-mono tabular-nums">{traceResultsLabel}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {showLegacyFallback ? <LegacyLogsFallback errors={legacyErrors} /> : null}
        {hasTraceListFailure ? (
          <div className="px-(--card-padding) pb-(--card-padding)">
            <ActionWarningState
              title="Recent traces unavailable"
              description={
                tracesError instanceof Error
                  ? tracesError.message
                  : 'Unable to load traces from API.'
              }
              onRetry={() => {
                void tracesQuery.refetch()
              }}
            />
          </div>
        ) : null}
        {!showLegacyFallback && !hasTraceListFailure ? (
          <>
            {listWarning ? (
              <div className="px-(--card-padding)">
                <ActionWarningState
                  variant="warning"
                  title="Trace list refresh failed"
                  description={listWarning}
                  onRetry={() => {
                    void tracesQuery.refetch()
                  }}
                />
              </div>
            ) : null}
            {!isMobile ? (
              <div
                className="px-(--card-padding)"
                tabIndex={0}
                onKeyDown={handleTableKeyDown}
                aria-label="Recent traces table. Use arrow keys or J/K to move selection, Enter to open details."
              >
                <ScrollArea className="h-[340px] rounded-lg border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Status</TableHead>
                        <TableHead className="min-w-[260px]">Trace</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Spans</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isTraceListLoading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <TableRow key={`trace-skeleton-${index}`}>
                              <TableCell>
                                <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                              </TableCell>
                              <TableCell>
                                <div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
                              </TableCell>
                              <TableCell>
                                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
                              </TableCell>
                              <TableCell>
                                <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted" />
                              </TableCell>
                              <TableCell>
                                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                              </TableCell>
                            </TableRow>
                          ))
                        : traces.map((trace) => {
                            const isSelected = trace.traceId === selectedTraceId

                            return (
                              <TableRow
                                key={trace.traceId}
                                data-state={isSelected ? 'selected' : undefined}
                                className={cn(
                                  'cursor-pointer',
                                  isSelected ? 'bg-accent/35 outline outline-1 outline-ring/30' : null
                                )}
                                onClick={() => handleSelectTrace(trace)}
                              >
                                <TableCell>
                                  <StatusIcon status={trace.status} />
                                </TableCell>
                                <TableCell>
                                  <div className="min-w-0">
                                    <p className="typography-size-sm typography-family-mono text-muted-foreground">
                                      {trace.traceId}
                                    </p>
                                    <p className="typography-size-sm typography-weight-medium text-foreground">
                                      {trace.method} {trace.route}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="gray-subtle">{trace.service}</Badge>
                                </TableCell>
                                <TableCell className="text-right typography-size-sm typography-family-mono tabular-nums text-foreground">
                                  {formatDuration(trace.durationMs)}
                                </TableCell>
                                <TableCell className="text-right typography-size-sm text-muted-foreground tabular-nums">
                                  {trace.spanCount}
                                </TableCell>
                                <TableCell className="text-right typography-size-sm text-muted-foreground tabular-nums">
                                  {formatTraceTime(trace.timestamp)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      {!isTraceListLoading && traces.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center">
                            <p className="typography-size-sm text-muted-foreground">{emptyListMessage}</p>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            ) : (
              <div className="px-(--card-padding)">
                <div className="space-y-2 rounded-lg border border-border/70 p-2">
                  {isTraceListLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={`trace-mobile-skeleton-${index}`}
                          className="rounded-md border border-border/60 px-3 py-2"
                        >
                          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                          <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
                          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
                        </div>
                      ))
                    : traces.map((trace) => {
                        const isSelected = trace.traceId === selectedTraceId

                        return (
                          <button
                            key={trace.traceId}
                            type="button"
                            className={cn(
                              'w-full rounded-md border border-border/60 px-3 py-2 text-left transition-colors',
                              isSelected ? 'bg-accent/30 ring-1 ring-ring/30' : 'hover:bg-muted/30'
                            )}
                            onClick={() => handleSelectTrace(trace)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-start gap-2">
                                <StatusIcon status={trace.status} />
                                <div className="min-w-0">
                                  <p className="typography-size-xs typography-family-mono text-muted-foreground">
                                    {trace.traceId}
                                  </p>
                                  <p className="typography-size-sm typography-weight-medium text-foreground">
                                    {trace.method} {trace.route}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="mt-0.5 size-(--icon-sm) text-muted-foreground" />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 typography-size-xs text-muted-foreground">
                              <Badge variant="gray-subtle">{trace.service}</Badge>
                              <span className="typography-family-mono tabular-nums text-foreground">
                                {formatDuration(trace.durationMs)}
                              </span>
                              <span>{trace.spanCount} spans</span>
                              <span>{formatTraceTime(trace.timestamp)}</span>
                            </div>
                          </button>
                        )
                      })}
                  {!isTraceListLoading && traces.length === 0 ? (
                    <div className="px-2 py-6 text-center">
                      <p className="typography-size-sm text-muted-foreground">{emptyListMessage}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            {!isMobile ? (
              <div className="border-t border-border/70 px-(--card-padding) pb-(--card-padding) pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3
                    ref={inspectorHeadingRef}
                    tabIndex={-1}
                    className="typography-size-sm typography-weight-medium"
                  >
                    Span Waterfall
                  </h3>
                  <p className="typography-size-xs typography-family-mono text-muted-foreground">
                    {activeTrace
                      ? `${activeTrace.traceId} · ${activeTrace.spanCount} spans`
                      : isTraceListLoading
                        ? 'Loading traces…'
                        : 'No trace selected'}
                  </p>
                </div>
                <div
                  data-slot="trace-waterfall-desktop-viewport"
                  className="h-[24rem] overflow-auto overscroll-contain [scrollbar-gutter:stable_both-edges]"
                >
                  {isWaterfallLoading ? (
                    <TraceWaterfallLoading />
                  ) : traceSpansQuery.isError ? (
                    <ActionWarningState
                      title="Trace detail unavailable"
                      description={
                        traceSpansQuery.error instanceof Error
                          ? traceSpansQuery.error.message
                          : 'Unable to load span waterfall.'
                      }
                      onRetry={() => {
                        void traceSpansQuery.refetch()
                      }}
                    />
                  ) : activeTrace && traceSpansQuery.data ? (
                    <TraceWaterfall
                      trace={activeTrace}
                      detail={traceSpansQuery.data}
                      selectedSpanId={selectedSpanIdForActiveTrace}
                      onSelectSpan={(spanId) =>
                        setSelectedSpanState({ traceId: activeTrace.traceId, spanId })
                      }
                    />
                  ) : (
                    <p className="typography-size-sm text-muted-foreground">
                      Select a trace to inspect span waterfall.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>

      <Sheet open={isMobileDetailsOpen} onOpenChange={onMobileDetailsOpenChange}>
        <SheetContent
          variant="geist-floating"
          className="overflow-hidden"
          onAnimationEnd={onMobileDetailsAnimationEnd}
        >
          <SheetHeader className="border-0 p-6 text-left">
            <SheetTitle className="typography-size-lg typography-weight-semibold">Span Waterfall</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex flex-1 flex-col px-6 pb-6">
            {(() => {
              const mobileTrace =
                allTraces.find((trace) => trace.traceId === mobileSheetTraceId) ?? selectedTrace

              if (!mobileTrace) {
                return (
                  <p className="typography-size-sm text-muted-foreground">
                    Select a trace to inspect span waterfall.
                  </p>
                )
              }

              if (traceSpansQuery.isLoading) {
                return <TraceWaterfallLoading compact laneCount={6} />
              }

              if (traceSpansQuery.isError) {
                return (
                  <ActionWarningState
                    title="Trace detail unavailable"
                    description={
                      traceSpansQuery.error instanceof Error
                        ? traceSpansQuery.error.message
                        : 'Unable to load span waterfall.'
                    }
                    onRetry={() => {
                      void traceSpansQuery.refetch()
                    }}
                  />
                )
              }

              if (!traceSpansQuery.data) return null

              return (
                <TraceWaterfall
                  trace={mobileTrace}
                  detail={traceSpansQuery.data}
                  scrollMode="sheet-mobile"
                  selectedSpanId={
                    selectedSpanState?.traceId === mobileTrace.traceId
                      ? selectedSpanState.spanId
                      : null
                  }
                  onSelectSpan={(spanId) =>
                    setSelectedSpanState({ traceId: mobileTrace.traceId, spanId })
                  }
                />
              )
            })()}
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  )
}
