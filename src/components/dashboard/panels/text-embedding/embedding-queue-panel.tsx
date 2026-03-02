'use client'

import { useMemo, type CSSProperties } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import type {
  EmbeddingQueueStatus,
  TextEmbeddingJobSummary,
} from '@/lib/schemas/text-embedding'
import { cn } from '@/lib/utils'
import { getEmbeddingStatusConfig } from './embedding-status-badge'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { AnimatedMetricValue } from '@/components/dashboard/panels/shared/animated-metric-value'

interface EmbeddingQueuePanelProps {
  jobs: TextEmbeddingJobSummary[]
  isLoading: boolean
  errorMessage?: string | null
  onRetry: () => void
  onSelectJob: (id: string) => void
  activeStatusFilter: EmbeddingQueueStatus | null
  onStatusFilterChange: (status: EmbeddingQueueStatus | null) => void
  selectedJobId?: string | null
  className?: string
}

type StatusCounts = Record<EmbeddingQueueStatus, number>

const queueMetricDefinitions: Array<{
  key: EmbeddingQueueStatus
  label: string
  valueClassName: string
  containerClassName: string
  activeContainerClassName: string
}> = [
  {
    key: 'queued',
    label: 'Queued',
    valueClassName: 'text-muted-foreground',
    containerClassName: 'border-border/70 bg-muted/20',
    activeContainerClassName: 'border-border bg-muted/35',
  },
  {
    key: 'processing',
    label: 'Processing',
    valueClassName: 'text-[oklch(0.53_0.11_250)] dark:text-[oklch(0.76_0.09_250)]',
    containerClassName:
      'border-[oklch(0.84_0.07_250)]/60 bg-[oklch(0.97_0.02_250)] dark:border-[oklch(0.40_0.07_250)] dark:bg-[oklch(0.23_0.04_250)]',
    activeContainerClassName:
      'border-[oklch(0.72_0.09_250)]/70 bg-[oklch(0.95_0.03_250)] dark:border-[oklch(0.57_0.08_250)] dark:bg-[oklch(0.27_0.05_250)]',
  },
  {
    key: 'completed',
    label: 'Completed',
    valueClassName: 'text-[oklch(0.52_0.12_150)] dark:text-[oklch(0.76_0.09_150)]',
    containerClassName:
      'border-[oklch(0.84_0.07_150)]/60 bg-[oklch(0.97_0.02_150)] dark:border-[oklch(0.42_0.07_150)] dark:bg-[oklch(0.23_0.04_150)]',
    activeContainerClassName:
      'border-[oklch(0.72_0.08_150)]/75 bg-[oklch(0.95_0.03_150)] dark:border-[oklch(0.56_0.08_150)] dark:bg-[oklch(0.28_0.05_150)]',
  },
  {
    key: 'failed',
    label: 'Failed',
    valueClassName: 'text-destructive',
    containerClassName:
      'border-[oklch(0.85_0.05_25)]/70 bg-[oklch(0.97_0.01_25)] dark:border-[oklch(0.42_0.06_25)] dark:bg-[oklch(0.24_0.03_25)]',
    activeContainerClassName:
      'border-[oklch(0.74_0.06_25)]/75 bg-[oklch(0.96_0.02_25)] dark:border-[oklch(0.56_0.07_25)] dark:bg-[oklch(0.28_0.04_25)]',
  },
]

const initialStatusCounts: StatusCounts = {
  queued: 0,
  processing: 0,
  completed: 0,
  failed: 0,
}

const statusDotClassName: Record<EmbeddingQueueStatus, string> = {
  queued: 'bg-muted-foreground/70',
  processing: 'bg-[oklch(0.60_0.10_250)]',
  completed: 'bg-[oklch(0.52_0.12_150)] dark:bg-[oklch(0.76_0.09_150)]',
  failed: 'bg-destructive',
}

export function sortEmbeddingQueueJobs(jobs: TextEmbeddingJobSummary[]) {
  return [...jobs].sort((left, right) => {
    const getPriorityRank = (status: EmbeddingQueueStatus) => {
      if (status === 'processing') {
        return 0
      }
      if (status === 'queued') {
        return 1
      }
      return 2
    }

    const rankDiff = getPriorityRank(left.status) - getPriorityRank(right.status)
    if (rankDiff !== 0) {
      return rankDiff
    }

    const rightUpdatedAt = new Date(right.updatedAt).getTime()
    const leftUpdatedAt = new Date(left.updatedAt).getTime()
    return rightUpdatedAt - leftUpdatedAt
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getProgressPercent(job: TextEmbeddingJobSummary) {
  const totalChunks = Math.max(1, job.progress.totalChunks)
  const completedChunks = Math.min(totalChunks, job.progress.completedChunks)
  return Math.min(100, Math.round((completedChunks / totalChunks) * 100))
}

function QueueStatusMetrics({
  statusCounts,
  activeStatusFilter,
  onStatusFilterChange,
}: {
  statusCounts: StatusCounts
  activeStatusFilter: EmbeddingQueueStatus | null
  onStatusFilterChange: (status: EmbeddingQueueStatus | null) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {queueMetricDefinitions.map((item) => {
        const isActive = activeStatusFilter === item.key

        return (
          <button
            key={item.key}
            type="button"
            className={cn(
              'w-full rounded-lg border px-3 py-2.5 text-left [touch-action:manipulation] transition-[background-color,border-color,box-shadow] duration-(--duration-moderate) focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-(--ring-width) focus-visible:outline-hidden',
              item.containerClassName,
              isActive
                ? cn('ring-1 ring-ring/30 shadow-xs', item.activeContainerClassName)
                : 'hover:shadow-xs'
            )}
            data-testid={`embedding-queue-metric-${item.key}`}
            aria-pressed={isActive}
            aria-label={`Filter queue by ${item.label}`}
            onClick={() => {
              onStatusFilterChange(isActive ? null : item.key)
            }}
          >
            <p
              className={cn(
                'typography-size-xs',
                isActive ? 'text-foreground/90' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </p>
            <AnimatedMetricValue
              value={statusCounts[item.key]}
              animationMode="on-change"
              className={cn(
                'mt-1 block typography-size-base typography-weight-semibold',
                item.valueClassName
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

function QueueLoadingState() {
  return Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="px-4 py-3">
      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-[92%] animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-[72%] animate-pulse rounded bg-muted" />
    </div>
  ))
}

function QueueItem({
  job,
  index,
  isSelected,
  onSelectJob,
}: {
  job: TextEmbeddingJobSummary
  index: number
  isSelected: boolean
  onSelectJob: (id: string) => void
}) {
  const statusConfig = getEmbeddingStatusConfig(job.status)
  const sourceTypeLabel = job.sourceType === 'url' ? 'URL' : 'TXT'
  const progressLabel = `${job.progress.completedChunks}/${job.progress.totalChunks} chunks`
  const progressPercent = getProgressPercent(job)
  const isActive = job.status === 'queued' || job.status === 'processing'
  const itemStyle: CSSProperties = {
    animationDelay: `${Math.min(index * 40, 240)}ms`,
    contentVisibility: 'auto',
    containIntrinsicSize: '0 96px',
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        'h-auto w-full justify-start rounded-none border-l-2 border-transparent px-4 py-3 text-left whitespace-normal transition-[background-color,border-color] duration-(--duration-moderate) hover:bg-muted/40 focus-visible:bg-muted/45 fade-in motion-reduce:animate-none',
        isSelected &&
          'border-l-primary bg-muted/45 hover:bg-muted/45 focus-visible:bg-muted/45'
      )}
      style={itemStyle}
      onClick={() => onSelectJob(job.id)}
      data-testid={`embedding-queue-item-${job.id}`}
      data-selected={isSelected ? 'true' : 'false'}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 [overflow-wrap:anywhere] typography-size-sm typography-weight-medium leading-5 text-foreground"
            data-testid={`embedding-queue-source-preview-${job.id}`}
          >
            {job.sourcePreview}
          </p>
          <div
            className="mt-1.5 flex flex-wrap items-center gap-1.5 [overflow-wrap:anywhere] typography-size-xs text-muted-foreground"
            data-testid={`embedding-queue-status-${job.id}`}
          >
            <span className="relative inline-flex h-2 w-2 shrink-0 items-center justify-center">
              {job.status === 'processing' ? (
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping motion-reduce:animate-none',
                    statusDotClassName[job.status]
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  statusDotClassName[job.status]
                )}
                aria-hidden
              />
            </span>
            <span className="typography-weight-medium text-foreground">
              {statusConfig.label}
            </span>
            <span aria-hidden>•</span>
            <span>{progressLabel}</span>
            <span aria-hidden>•</span>
            <span>{formatTime(job.updatedAt)}</span>
          </div>
          {isActive ? (
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-muted/70"
              data-testid={`embedding-queue-progress-${job.id}`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-(--duration-moderate)',
                  job.status === 'processing'
                    ? 'bg-[oklch(0.60_0.10_250)] shimmer motion-reduce:animate-none'
                    : 'bg-muted-foreground/70'
                )}
                style={{ width: `${Math.max(6, progressPercent)}%` }}
              />
            </div>
          ) : null}
          <div
            className="mt-1.5 flex flex-wrap items-center gap-1.5 [overflow-wrap:anywhere] typography-size-xs text-muted-foreground"
            data-testid={`embedding-queue-meta-${job.id}`}
          >
            <span
              className="typography-family-mono typography-weight-medium uppercase tracking-[0.08em]"
              data-testid={`embedding-queue-source-type-${job.id}`}
            >
              {sourceTypeLabel}
            </span>
            <span aria-hidden>•</span>
            <span>{job.model}</span>
            <span aria-hidden>•</span>
            <span>{job.dimensions}d</span>
            <span aria-hidden>•</span>
            <span className="typography-family-mono">#{job.id}</span>
          </div>
        </div>
        <ChevronRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          data-testid={`embedding-queue-chevron-${job.id}`}
          aria-hidden
        />
      </div>
    </Button>
  )
}

export function EmbeddingQueuePanel({
  jobs,
  isLoading,
  errorMessage,
  onRetry,
  onSelectJob,
  activeStatusFilter,
  onStatusFilterChange,
  selectedJobId,
  className,
}: EmbeddingQueuePanelProps) {
  const statusCounts = useMemo(() => {
    return jobs.reduce<StatusCounts>((counts, job) => {
      counts[job.status] += 1
      return counts
    }, { ...initialStatusCounts })
  }, [jobs])
  const sortedJobs = useMemo(() => sortEmbeddingQueueJobs(jobs), [jobs])
  const filteredJobs = useMemo(() => {
    if (!activeStatusFilter) {
      return sortedJobs
    }

    return sortedJobs.filter((job) => job.status === activeStatusFilter)
  }, [activeStatusFilter, sortedJobs])
  const activeFilterLabel = activeStatusFilter
    ? getEmbeddingStatusConfig(activeStatusFilter).label
    : null
  const queueCountLabel = activeStatusFilter
    ? `${filteredJobs.length} of ${jobs.length} jobs`
    : `${jobs.length} jobs total`
  const filterAnnouncement = activeStatusFilter
    ? `Showing ${filteredJobs.length} ${activeFilterLabel?.toLowerCase()} jobs out of ${jobs.length}.`
    : `Showing all ${jobs.length} jobs.`

  return (
    <Card
      className={cn(
        'border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/85',
        className
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="typography-size-base typography-weight-medium">
            Embedding Queue
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <span className="typography-size-xs text-muted-foreground tabular-nums">
              {queueCountLabel}
            </span>
            {activeStatusFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-(--button-height-xs) px-(--button-padding-x-xs) typography-size-xs"
                onClick={() => {
                  onStatusFilterChange(null)
                }}
              >
                Clear filter
              </Button>
            ) : null}
          </div>
        </div>
        <QueueStatusMetrics
          statusCounts={statusCounts}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        <p aria-live="polite" className="sr-only">
          {filterAnnouncement}
        </p>
        {errorMessage ? (
          <div className="px-(--card-padding)">
            <ActionWarningState
              title="Queue request failed"
              description={errorMessage}
              onRetry={onRetry}
            />
          </div>
        ) : null}
        <ScrollArea className="h-[520px]">
          <div
            className="divide-y divide-border/70"
            data-testid="embedding-queue-list"
          >
            {isLoading ? (
              <QueueLoadingState />
            ) : jobs.length === 0 ? (
              <div className="px-4 py-10 text-center typography-size-sm text-muted-foreground">
                No embeddings queued yet.
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="typography-size-sm text-muted-foreground">
                  No {activeFilterLabel} jobs in queue.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onStatusFilterChange(null)
                  }}
                >
                  Clear filter
                </Button>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <QueueItem
                  key={job.id}
                  job={job}
                  index={index}
                  isSelected={selectedJobId === job.id}
                  onSelectJob={onSelectJob}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
