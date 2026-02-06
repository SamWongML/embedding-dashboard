'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Activity,
  BarChart3,
  FileText,
  Image,
  Search,
  Database,
  GitBranch,
  Users,
} from 'lucide-react'

const navigationItems = [
  { icon: Activity, label: 'Server Status', href: '/', keywords: ['health', 'monitoring', 'status'] },
  { icon: BarChart3, label: 'Metrics', href: '/metrics', keywords: ['analytics', 'charts', 'data'] },
  { icon: FileText, label: 'Text Embedding', href: '/text-embedding', keywords: ['text', 'embed', 'vector'] },
  { icon: Image, label: 'Image Embedding', href: '/image-embedding', keywords: ['image', 'vision', 'picture'] },
  { icon: Search, label: 'Hybrid Search', href: '/search', keywords: ['search', 'query', 'find'] },
  { icon: Database, label: 'Records', href: '/records', keywords: ['data', 'table', 'list'] },
  { icon: GitBranch, label: 'Graph', href: '/graph', keywords: ['neo4j', 'nodes', 'relationships'] },
  { icon: Users, label: 'Users', href: '/users', keywords: ['admin', 'permissions', 'access'] },
]

export function SearchCommand() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = React.useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-(--form-item-gap) rounded-md border border-input bg-background px-(--input-padding-x) py-(--space-sm) text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-(--search-width)"
      >
        <Search className="size-(--icon-sm)" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-(--search-kbd-height) select-none items-center gap-(--dropdown-gap) rounded border bg-muted px-(--dropdown-item-padding-y) font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.keywords.join(' ')}`}
                onSelect={() => handleSelect(item.href)}
              >
                <item.icon className="mr-(--form-item-gap) size-(--icon-sm)" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
