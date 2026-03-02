'use client'

import { useMemo, useState } from 'react'
import type { AnimationEventHandler } from 'react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTextEmbeddingJobDetail } from '@/lib/hooks/use-text-embedding'
import { toActionErrorMessage } from '@/lib/api'
import { Check, Copy } from 'lucide-react'
import { EmbeddingStatusBadge } from './embedding-status-badge'
import {
  createVectorMagnitudeBins,
  formatProcessingDuration,
  formatVectorPreview,
} from './embedding-vector-utils'

interface EmbeddingJobDetailSheetProps {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAnimationEnd: AnimationEventHandler<HTMLElement>
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getMetricValue(value?: number) {
  if (typeof value !== 'number') {
    return '—'
  }

  return value.toLocaleString()
}

export function EmbeddingJobDetailSheet({
  jobId,
  open,
  onOpenChange,
  onAnimationEnd,
}: EmbeddingJobDetailSheetProps) {
  const [copied, setCopied] = useState(false)
  const detailQuery = useTextEmbeddingJobDetail(jobId)
  const job = detailQuery.data
  const actionWarning = detailQuery.isError
    ? toActionErrorMessage(detailQuery.error, 'Unable to load job details.')
    : null

  const firstVector = job?.result?.results[0]?.vector ?? []
  const vectorPreview = useMemo(() => formatVectorPreview(firstVector), [firstVector])
  const magnitudeBins = useMemo(
    () => createVectorMagnitudeBins(firstVector),
    [firstVector]
  )
  const totalTokens =
    job?.result?.totalTokens ?? job?.usage?.totalTokens ?? job?.usage?.inputTokens

  const handleCopy = async () => {
    if (firstVector.length === 0) return
    await navigator.clipboard.writeText(JSON.stringify(firstVector))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onAnimationEnd={onAnimationEnd}
        className="max-h-[90vh] max-w-[960px] overflow-hidden p-0"
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden">
          <DialogHeader className="gap-2 border-b border-border px-6 py-5 text-left">
            <div className="flex items-center justify-between gap-3 pr-12">
              <DialogTitle>Embedding Result</DialogTitle>
              {job ? <EmbeddingStatusBadge status={job.status} /> : null}
            </div>
            <DialogDescription className="typography-size-sm text-muted-foreground">
              {job
                ? `${job.id} - ${job.model} (${job.dimensions}d)`
                : 'Live details for asynchronous embedding execution.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {detailQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : null}

            {actionWarning ? (
              <ActionWarningState
                title="Job detail request failed"
                description={actionWarning}
                onRetry={() => {
                  void detailQuery.refetch()
                }}
              />
            ) : null}

            {job && !detailQuery.isLoading && !actionWarning ? (
              <div className="space-y-5">
                <section className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4">
                  <p className="typography-size-xs typography-weight-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Input
                  </p>
                  <p className="typography-size-sm leading-6 text-foreground">
                    {job.sourcePreview}
                  </p>
                  {job.sourceUrl ? (
                    <p className="break-all typography-size-xs text-muted-foreground">
                      {job.sourceUrl}
                    </p>
                  ) : null}
                </section>

                <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-border/80 bg-card px-3 py-3">
                    <p className="typography-size-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Tokens
                    </p>
                    <p className="mt-1 typography-size-base typography-weight-semibold">
                      {getMetricValue(totalTokens)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card px-3 py-3">
                    <p className="typography-size-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Chunks
                    </p>
                    <p className="mt-1 typography-size-base typography-weight-semibold">
                      {job.progress.completedChunks} / {job.progress.totalChunks}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card px-3 py-3">
                    <p className="typography-size-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Dimensions
                    </p>
                    <p className="mt-1 typography-size-base typography-weight-semibold">
                      {job.dimensions}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card px-3 py-3">
                    <p className="typography-size-xs uppercase tracking-[0.08em] text-muted-foreground">
                      Duration
                    </p>
                    <p className="mt-1 typography-size-base typography-weight-semibold">
                      {formatProcessingDuration(job.result?.processingTime)}
                    </p>
                  </div>
                </section>

                {job.error ? (
                  <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="typography-size-sm typography-weight-medium text-destructive">
                      {job.error.code}
                    </p>
                    <p className="mt-1 typography-size-sm">{job.error.message}</p>
                    <p className="mt-2 typography-size-xs text-muted-foreground">
                      Retryable: {job.error.retryable ? 'Yes' : 'No'}
                    </p>
                  </section>
                ) : null}

                {job.result ? (
                  <section className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="typography-size-sm typography-weight-medium">
                        Vector Preview (first 8 dims)
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={firstVector.length === 0}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-1.5 h-4 w-4 text-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-4 w-4" />
                            Copy Full Vector
                          </>
                        )}
                      </Button>
                    </div>

                    {vectorPreview.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {vectorPreview.map((value, index) => (
                          <span
                            key={`${value}-${index}`}
                            className="rounded-md bg-primary/10 px-2 py-1 typography-family-mono typography-size-xs text-primary"
                          >
                            {value}
                          </span>
                        ))}
                        {firstVector.length > vectorPreview.length ? (
                          <span className="self-center typography-size-xs text-muted-foreground">
                            ... +{firstVector.length - vectorPreview.length} more
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="typography-size-sm text-muted-foreground">
                        Vector data is unavailable for this result.
                      </p>
                    )}

                    {magnitudeBins.length > 0 ? (
                      <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
                        <p className="typography-size-xs typography-weight-medium uppercase tracking-[0.08em] text-muted-foreground">
                          Magnitude Distribution
                        </p>
                        <div className="flex h-20 items-end gap-1">
                          {magnitudeBins.map((bin) => (
                            <div
                              key={bin.index}
                              className="flex-1 rounded-sm bg-primary/70"
                              style={{ height: `${Math.max(8, bin.value)}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="rounded-xl border border-border/80 bg-card p-4">
                    <h3 className="typography-size-sm typography-weight-medium">
                      Embedded Result
                    </h3>
                    <p className="mt-2 typography-size-sm text-muted-foreground">
                      Result will appear once the job is completed.
                    </p>
                  </section>
                )}

                <section className="rounded-xl border border-border/80 bg-card p-4">
                  <h3 className="typography-size-sm typography-weight-medium">Timeline</h3>
                  <div className="mt-3 space-y-0">
                    {[
                      { label: 'Queued at', value: formatDateTime(job.queuedAt) },
                      { label: 'Started at', value: formatDateTime(job.startedAt) },
                      { label: 'Completed at', value: formatDateTime(job.completedAt) },
                      { label: 'Updated at', value: formatDateTime(job.updatedAt) },
                    ].map((row, index, rows) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between py-2 ${
                          index === rows.length - 1 ? '' : 'border-b border-border/70'
                        }`}
                      >
                        <span className="typography-size-sm text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="typography-size-sm typography-weight-medium">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
