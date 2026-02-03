'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchSimpleMode } from './search-simple-mode'
import { SearchTechnicalMode } from './search-technical-mode'
import { cn } from '@/lib/utils'

interface SearchPanelProps {
  className?: string
}

export function SearchPanel({ className }: SearchPanelProps) {
  const [mode, setMode] = useState<'simple' | 'technical'>('simple')

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'technical')}>
        <TabsList>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="mt-6">
          <SearchSimpleMode />
        </TabsContent>
        <TabsContent value="technical" className="mt-6">
          <SearchTechnicalMode />
        </TabsContent>
      </Tabs>
    </div>
  )
}
