'use client'

import { useMemo } from 'react'
import { SimpleMode } from './simple-mode'
import { TechnicalMode } from './technical-mode'
import { EmbeddingQueuePanel } from './embedding-queue-panel'
import { EmbeddingJobDetailSheet } from './embedding-job-detail-sheet'
import { useServiceMode } from '@/components/providers/service-mode-provider'
import { toActionErrorMessage } from '@/lib/api'
import { useTextEmbeddingQueue } from '@/lib/hooks/use-text-embedding'
import { useDelayedSheetSelection } from '@/lib/hooks/use-delayed-sheet-selection'
import { cn } from '@/lib/utils'

interface TextEmbeddingPanelProps {
  className?: string
}

export function TextEmbeddingPanel({ className }: TextEmbeddingPanelProps) {
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

  const handleJobCreated = () => {
    void queueQuery.refetch()
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,1.38fr)_minmax(22rem,1fr)]">
        {serviceMode === 'technical' ? (
          <TechnicalMode onJobCreated={handleJobCreated} />
        ) : (
          <SimpleMode onJobCreated={handleJobCreated} />
        )}
        <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <EmbeddingQueuePanel
            jobs={queueQuery.data?.jobs ?? []}
            isLoading={queueQuery.isLoading}
            errorMessage={queueActionWarning}
            onRetry={() => {
              void queueQuery.refetch()
            }}
            onSelectJob={selectJobId}
          />
        </div>
      </div>

      <EmbeddingJobDetailSheet
        jobId={selectedJobId}
        open={isJobDetailsOpen}
        onOpenChange={onJobDetailsOpenChange}
        onAnimationEnd={onJobDetailsAnimationEnd}
      />
    </div>
  )
}
