'use client'

import { useMemo, type CSSProperties } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Link2, ChevronRight } from 'lucide-react'
import type {
  EmbeddingQueueStatus,
  TextEmbeddingJobSummary,
} from '@/lib/schemas/text-embedding'
import { cn } from '@/lib/utils'
import {
  EmbeddingStatusBadge,
  getEmbeddingStatusConfig,
} from './embedding-status-badge'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { AnimatedMetricValue } from '@/components/dashboard/panels/shared/animated-metric-value'

interface EmbeddingQueuePanelProps {
  jobs: TextEmbeddingJobSummary[]
  isLoading: boolean
  errorMessage?: string | null
  onRetry: () => void
  onSelectJob: (id: string) => void
  className?: string
}

type StatusCounts = Record<EmbeddingQueueStatus, number>

const queueMetricDefinitions: Array<{
  key: EmbeddingQueueStatus
  label: string
  valueClassName: string
  containerClassName: string
}> = [
  {
    key: 'queued',
    label: 'Queued',
    valueClassName: 'text-muted-foreground',
    containerClassName: 'border-border/70 bg-muted/20',
  },
  {
    key: 'processing',
    label: 'Processing',
    valueClassName: 'text-[oklch(0.53_0.11_250)] dark:text-[oklch(0.76_0.09_250)]',
    containerClassName:
      'border-[oklch(0.84_0.07_250)]/60 bg-[oklch(0.97_0.02_250)] dark:border-[oklch(0.40_0.07_250)] dark:bg-[oklch(0.23_0.04_250)]',
  },
  {
    key: 'completed',
    label: 'Completed',
    valueClassName: 'text-[oklch(0.52_0.12_150)] dark:text-[oklch(0.76_0.09_150)]',
    containerClassName:
      'border-[oklch(0.84_0.07_150)]/60 bg-[oklch(0.97_0.02_150)] dark:border-[oklch(0.42_0.07_150)] dark:bg-[oklch(0.23_0.04_150)]',
  },
  {
    key: 'failed',
    label: 'Failed',
    valueClassName: 'text-destructive',
    containerClassName:
      'border-[oklch(0.85_0.05_25)]/70 bg-[oklch(0.97_0.01_25)] dark:border-[oklch(0.42_0.06_25)] dark:bg-[oklch(0.24_0.03_25)]',
  },
]

const initialStatusCounts: StatusCounts = {
  queued: 0,
  processing: 0,
  completed: 0,
  failed: 0,
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

function QueueStatusMetrics({ statusCounts }: { statusCounts: StatusCounts }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {queueMetricDefinitions.map((item) => (
        <div
          key={item.key}
          className={cn(
            'rounded-lg border px-3 py-2.5',
            item.containerClassName
          )}
          data-testid={`embedding-queue-metric-${item.key}`}
        >
          <p className="typography-size-xs text-muted-foreground">{item.label}</p>
          <AnimatedMetricValue
            value={statusCounts[item.key]}
            animationMode="on-change"
            className={cn(
              'mt-1 block typography-size-base typography-weight-semibold',
              item.valueClassName
            )}
          />
        </div>
      ))}
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
  onSelectJob,
}: {
  job: TextEmbeddingJobSummary
  index: number
  onSelectJob: (id: string) => void
}) {
  const statusConfig = getEmbeddingStatusConfig(job.status)
  const StatusIcon = statusConfig.icon
  const SourceIcon = job.sourceType === 'url' ? Link2 : FileText
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
      className="h-auto w-full justify-start rounded-none px-4 py-3 text-left transition-[background-color,border-color] duration-(--duration-moderate) hover:bg-muted/40 focus-visible:bg-muted/45 fade-in motion-reduce:animate-none"
      style={itemStyle}
      onClick={() => onSelectJob(job.id)}
      data-testid={`embedding-queue-item-${job.id}`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/35">
            <SourceIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusIcon
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground',
                  statusConfig.iconClassName
                )}
                aria-hidden
              />
              <Badge variant="outline" className="typography-size-xs">
                {sourceTypeLabel}
              </Badge>
              <span className="typography-size-xs text-muted-foreground">{job.id}</span>
            </div>
            <p className="mt-1 line-clamp-2 typography-size-sm typography-weight-medium leading-5 text-foreground">
              {job.sourcePreview}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 typography-size-xs text-muted-foreground">
              <span>{job.model}</span>
              <span aria-hidden>•</span>
              <span>{job.dimensions}d</span>
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
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <EmbeddingStatusBadge status={job.status} />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
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
  className,
}: EmbeddingQueuePanelProps) {
  const statusCounts = useMemo(() => {
    return jobs.reduce<StatusCounts>((counts, job) => {
      counts[job.status] += 1
      return counts
    }, { ...initialStatusCounts })
  }, [jobs])

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
          <span className="typography-size-xs text-muted-foreground tabular-nums">
            {jobs.length} jobs total
          </span>
        </div>
        <QueueStatusMetrics statusCounts={statusCounts} />
      </CardHeader>
      <CardContent className="space-y-3 p-0">
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
            ) : (
              jobs.map((job, index) => (
                <QueueItem
                  key={job.id}
                  job={job}
                  index={index}
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
