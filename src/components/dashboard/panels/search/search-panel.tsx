'use client'

import { SearchSimpleMode } from './search-simple-mode'
import { SearchTechnicalMode } from './search-technical-mode'
import { useServiceMode } from '@/components/providers/service-mode-provider'
import { cn } from '@/lib/utils'

interface SearchPanelProps {
  className?: string
}

export function SearchPanel({ className }: SearchPanelProps) {
  const { serviceMode } = useServiceMode()

  return (
    <div className={cn('space-y-6', className)}>
      {serviceMode === 'technical' ? <SearchTechnicalMode /> : <SearchSimpleMode />}
    </div>
  )
}
