'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

function SelectorTabs(props: React.ComponentProps<typeof Tabs>) {
  return <Tabs {...props} />
}

function SelectorTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return <TabsList className={cn('w-fit', className)} {...props} />
}

function SelectorTabsTrigger(props: React.ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger {...props} />
}

function SelectorTabsContent(props: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent {...props} />
}

export {
  SelectorTabs,
  SelectorTabsList,
  SelectorTabsTrigger,
  SelectorTabsContent,
}
