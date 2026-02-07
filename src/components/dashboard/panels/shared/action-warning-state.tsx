'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isApiDataMode } from '@/lib/runtime/data-mode'
import { cn } from '@/lib/utils'

interface ActionWarningStateProps {
  title: string
  description: string
  variant?: 'error' | 'warning'
  onRetry?: () => void
  retryLabel?: string
}

const showDevHint =
  process.env.NODE_ENV !== 'production' &&
  isApiDataMode()

export function ActionWarningState({
  title,
  description,
  variant = 'error',
  onRetry,
  retryLabel = 'Retry',
}: ActionWarningStateProps) {
  const isError = variant === 'error'

  return (
    <Card className={cn(isError ? 'border-destructive/30' : 'border-warning/40')}>
      <CardHeader className="pb-3">
        <CardTitle
          className={cn(
            'flex items-center gap-2 text-base font-medium',
            isError ? 'text-destructive' : 'text-warning'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="whitespace-pre-line text-muted-foreground">{description}</p>
        {showDevHint ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Demo mode: set <code className="font-mono">NEXT_PUBLIC_DATA_MODE=demo</code> and restart <code className="font-mono">pnpm dev</code>.
          </div>
        ) : null}
        {onRetry ? (
          <div>
            <Button size="sm" variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

