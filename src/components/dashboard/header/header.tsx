'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchCommand } from './search-command'
import { useSidebar } from '@/components/dashboard/sidebar'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { collapsed } = useSidebar()

  return (
    <header
      className={cn(
        'sticky top-0 z-(--z-fixed) flex h-(--header-height) items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-(--header-padding-x) transition-all duration-(--duration-slow)',
        collapsed ? 'ml-(--sidebar-width-collapsed)' : 'ml-(--sidebar-width)'
      )}
    >
      <div className="flex items-center gap-(--dialog-gap)">
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-(--form-item-gap)">
        <SearchCommand />
        <Button variant="ghost" size="icon" className="size-(--input-height)">
          <Bell className="size-(--icon-sm)" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
