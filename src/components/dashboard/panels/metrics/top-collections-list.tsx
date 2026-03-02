'use client'

import { cn } from '@/lib/utils'
import type { TopCollection } from '@/lib/schemas/metrics'

interface TopCollectionsListProps {
  collections: TopCollection[]
  className?: string
}

function formatRequestCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }

  return count.toString()
}

export function TopCollectionsList({ collections, className }: TopCollectionsListProps) {
  const totalRequests = collections.reduce((total, collection) => total + collection.requestCount, 0)
  const maxRequestCount = Math.max(...collections.map((collection) => collection.requestCount), 0)

  if (collections.length === 0) {
    return (
      <div className={cn('flex h-[200px] items-center justify-center typography-size-sm text-muted-foreground', className)}>
        No collection activity yet.
      </div>
    )
  }

  return (
    <div className={cn('space-y-2.5', className)} role="list" aria-label="Most accessed collections">
      {collections.map((collection, index) => {
        const share = totalRequests > 0 ? (collection.requestCount / totalRequests) * 100 : 0
        const barWidth = maxRequestCount === 0
          ? 6
          : Math.max(6, (collection.requestCount / maxRequestCount) * 100)
        const formattedRequestCount = formatRequestCount(collection.requestCount)
        const inferredCollectionName = collection.id
          .split(/[\s_-]+/)
          .filter(Boolean)
          .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
          .join(' ')
        const collectionName = collection.collectionName ?? (inferredCollectionName || 'Unassigned')

        return (
          <div
            key={collection.id}
            role="listitem"
            data-slot="top-collections-row"
            tabIndex={0}
            aria-label={`${collection.name}: ${collection.requestCount.toLocaleString()} requests, ${share.toFixed(1)} percent of top collections`}
            className="rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-4 typography-size-xs typography-weight-medium text-muted-foreground">
                  {index + 1}
                </span>
                <p className="min-w-0 truncate typography-size-sm typography-weight-medium text-foreground">
                  <span>{collection.name}</span>
                  <span aria-hidden className="px-1 text-muted-foreground">·</span>
                  <span className="typography-size-xs text-muted-foreground">
                    {collectionName}
                  </span>
                </p>
              </div>
              <p className="shrink-0 whitespace-nowrap typography-size-sm typography-weight-medium tabular-nums text-foreground">
                {formattedRequestCount}{' '}
                <span className="typography-size-xs text-muted-foreground">
                  {share.toFixed(0)}%
                </span>
              </p>
            </div>
            <div
              data-slot="top-collections-rail"
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--chart-track)]"
            >
              <div
                data-slot="top-collections-rail-fill"
                className="h-full rounded-full bg-[var(--chart-accent)] transition-[width] duration-300 ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
