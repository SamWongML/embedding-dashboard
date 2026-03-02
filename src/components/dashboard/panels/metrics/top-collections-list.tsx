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
    <div className={cn('space-y-3', className)} role="list" aria-label="Most accessed collections">
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
            className="rounded-lg px-2 py-2 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-2">
                <span className="w-4 typography-size-xs typography-weight-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate typography-size-sm typography-weight-medium text-foreground">
                    {collection.name}
                  </p>
                  <p className="truncate typography-size-xs text-muted-foreground">
                    {collectionName}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="typography-size-sm typography-weight-medium text-foreground">
                  {formattedRequestCount}
                </p>
                <p className="typography-size-xs text-muted-foreground">
                  {share.toFixed(0)}%
                </p>
              </div>
            </div>
            <div
              data-slot="top-collections-rail"
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--chart-track)]"
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
