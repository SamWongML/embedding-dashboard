import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContentShellProps {
  children: ReactNode
  className?: string
  topInset?: 'default' | 'none'
}

export function PageContentShell({
  children,
  className,
  topInset = 'default',
}: PageContentShellProps) {
  return (
    <div
      data-slot="page-content-shell"
      className={cn(
        'shrink-0 px-(--space-page-inline) pb-(--space-page-shell-padding-bottom)',
        topInset === 'none' ? 'pt-0' : 'pt-(--space-page-top)',
        className
      )}
    >
      {children}
    </div>
  )
}
