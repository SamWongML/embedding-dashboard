'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { navigationItems } from '@/components/dashboard/navigation.config'

export function CommandPalette() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSelect = React.useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-(--search-width) justify-start gap-(--form-item-gap) border-input bg-background px-(--input-padding-x) py-(--space-sm) text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="size-(--icon-sm)" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-(--search-kbd-height) select-none items-center gap-(--dropdown-gap) rounded border bg-muted px-(--dropdown-item-padding-y) font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      {hasMounted ? (
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
      ) : null}
    </>
  )
}
