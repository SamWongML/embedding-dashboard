'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SimpleMode } from './simple-mode'
import { TechnicalMode } from './technical-mode'
import { EmbeddingQueuePanel } from './embedding-queue-panel'
import { EmbeddingJobDetailSheet } from './embedding-job-detail-sheet'
import { useServiceMode } from '@/components/providers/service-mode-provider'
import { toActionErrorMessage } from '@/lib/api'
import { useTextEmbeddingQueue } from '@/lib/hooks/use-text-embedding'
import { useDelayedSheetSelection } from '@/lib/hooks/use-delayed-sheet-selection'
import type {
  EmbeddingQueueStatus,
  TextEmbeddingJobSummary,
} from '@/lib/schemas/text-embedding'
import {
  parseQueueStatusFilter,
  toQueueStatusQueryValue,
} from '@/lib/schemas/queue-status-filter'
import { cn } from '@/lib/utils'

interface TextEmbeddingPanelProps {
  className?: string
}

const QUEUE_STATUS_PARAM_KEY = 'queueStatus'

export function TextEmbeddingPanel({ className }: TextEmbeddingPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { serviceMode } = useServiceMode()
  const queueQuery = useTextEmbeddingQueue({ limit: 50 })
  const {
    open: isJobDetailsOpen,
    selectedValue: selectedJobId,
    selectValue: selectJobId,
    onOpenChange: onJobDetailsOpenChange,
    onSheetAnimationEnd: onJobDetailsAnimationEnd,
  } = useDelayedSheetSelection<string>()

  const queueActionWarning = useMemo(() => {
    if (!queueQuery.isError) {
      return null
    }

    return toActionErrorMessage(
      queueQuery.error,
      'Unable to refresh embedding queue.'
    )
  }, [queueQuery.error, queueQuery.isError])
  const activeStatusFilter = useMemo(
    () => parseQueueStatusFilter(searchParams.get(QUEUE_STATUS_PARAM_KEY)),
    [searchParams]
  )
  const selectedJobSummary = useMemo<TextEmbeddingJobSummary | null>(() => {
    if (!selectedJobId) {
      return null
    }

    return queueQuery.data?.jobs.find((job) => job.id === selectedJobId) ?? null
  }, [queueQuery.data?.jobs, selectedJobId])

  const handleJobCreated = () => {
    void queueQuery.refetch()
  }
  const handleQueueStatusFilterChange = useCallback(
    (nextStatus: EmbeddingQueueStatus | null) => {
      const nextSearchParams = new URLSearchParams(searchParams.toString())
      const queryValue = toQueueStatusQueryValue(nextStatus)
      const currentValue = searchParams.get(QUEUE_STATUS_PARAM_KEY)

      if (queryValue === currentValue || (!queryValue && !currentValue)) {
        return
      }

      if (queryValue) {
        nextSearchParams.set(QUEUE_STATUS_PARAM_KEY, queryValue)
      } else {
        nextSearchParams.delete(QUEUE_STATUS_PARAM_KEY)
      }

      const nextQueryString = nextSearchParams.toString()
      const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
      router.replace(nextUrl, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,1.38fr)_minmax(22rem,1fr)]">
        {serviceMode === 'technical' ? (
          <TechnicalMode className="min-w-0" onJobCreated={handleJobCreated} />
        ) : (
          <SimpleMode className="min-w-0" onJobCreated={handleJobCreated} />
        )}
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <EmbeddingQueuePanel
            jobs={queueQuery.data?.jobs ?? []}
            isLoading={queueQuery.isLoading}
            errorMessage={queueActionWarning}
            onRetry={() => {
              void queueQuery.refetch()
            }}
            onSelectJob={selectJobId}
            activeStatusFilter={activeStatusFilter}
            onStatusFilterChange={handleQueueStatusFilterChange}
            selectedJobId={selectedJobId}
          />
        </div>
      </div>

      <EmbeddingJobDetailSheet
        jobId={selectedJobId}
        jobSummary={selectedJobSummary}
        open={isJobDetailsOpen}
        onOpenChange={onJobDetailsOpenChange}
        onAnimationEnd={onJobDetailsAnimationEnd}
      />
    </div>
  )
}
