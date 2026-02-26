'use client'

import { SimpleMode } from './simple-mode'
import { TechnicalMode } from './technical-mode'
import { useServiceMode } from '@/components/providers/service-mode-provider'
import { cn } from '@/lib/utils'

interface TextEmbeddingPanelProps {
  className?: string
}

export function TextEmbeddingPanel({ className }: TextEmbeddingPanelProps) {
  const { serviceMode } = useServiceMode()

  return (
    <div className={cn('space-y-6', className)}>
      {serviceMode === 'technical' ? <TechnicalMode /> : <SimpleMode />}
    </div>
  )
}
