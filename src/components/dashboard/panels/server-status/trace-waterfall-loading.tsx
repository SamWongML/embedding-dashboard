import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TraceWaterfallLoadingProps {
  laneCount?: number
  compact?: boolean
  className?: string
}

const DEFAULT_LANE_COUNT = 8

const laneLabelWidths = ['w-20', 'w-24', 'w-16', 'w-28', 'w-[5.5rem]', 'w-[4.5rem]']

export function TraceWaterfallLoading({
  laneCount = DEFAULT_LANE_COUNT,
  compact = false,
  className,
}: TraceWaterfallLoadingProps) {
  return (
    <div data-slot="trace-waterfall-loading" className={cn('space-y-4', className)}>
      <div className={cn('space-y-4', compact ? 'min-w-0' : 'min-w-[30rem]')}>
        <div className="flex items-center justify-between">
          <Skeleton aria-hidden className="h-4 w-8 rounded-sm" />
          <Skeleton aria-hidden className="h-4 w-16 rounded-sm" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: laneCount }).map((_, index) => (
            <div
              key={`trace-waterfall-loading-row-${index}`}
              className={cn(
                'items-center',
                compact
                  ? 'grid grid-cols-[7rem_1fr] gap-2'
                  : 'grid grid-cols-[minmax(6.5rem,8rem)_minmax(20rem,1fr)] gap-2 md:grid-cols-[minmax(9rem,11rem)_1fr] md:gap-3'
              )}
            >
              <Skeleton
                aria-hidden
                className={cn(
                  'h-4 rounded-sm',
                  laneLabelWidths[index % laneLabelWidths.length]
                )}
              />
              <Skeleton aria-hidden className={cn('rounded-md', compact ? 'h-7' : 'h-8')} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <Skeleton aria-hidden className="h-4 w-48 rounded-sm" />
      </div>
      <Skeleton aria-hidden className="h-3 w-56 rounded-sm" />
    </div>
  )
}
