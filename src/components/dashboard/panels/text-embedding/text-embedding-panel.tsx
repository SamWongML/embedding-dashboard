'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SimpleMode } from './simple-mode'
import { TechnicalMode } from './technical-mode'
import { cn } from '@/lib/utils'

interface TextEmbeddingPanelProps {
  className?: string
}

export function TextEmbeddingPanel({ className }: TextEmbeddingPanelProps) {
  const [mode, setMode] = useState<'simple' | 'technical'>('simple')

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'technical')}>
        <TabsList>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="mt-6">
          <SimpleMode />
        </TabsContent>
        <TabsContent value="technical" className="mt-6">
          <TechnicalMode />
        </TabsContent>
      </Tabs>
    </div>
  )
}
