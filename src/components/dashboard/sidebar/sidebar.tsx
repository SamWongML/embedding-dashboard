'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Activity,
  BarChart3,
  FileText,
  Image,
  Search,
  Database,
  GitBranch,
  Users,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AccountMenu } from '@/components/account'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

const MOBILE_BREAKPOINT = 1024 // lg breakpoint

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [isMobile, setIsMobile] = React.useState(false)
  const [userPreference, setUserPreference] = React.useState<boolean | null>(null)

  // Initialize from localStorage and detect initial screen size
  React.useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) {
      setUserPreference(stored === 'true')
    }

    // Set initial mobile state
    const checkMobile = () => window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile(checkMobile())

    // Auto-collapse on mobile if no user preference
    if (stored === null && checkMobile()) {
      setCollapsed(true)
    } else if (stored !== null) {
      setCollapsed(stored === 'true')
    }
  }, [])

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      // Auto-collapse on mobile, expand on desktop (unless user preferred collapsed)
      if (mobile) {
        setCollapsed(true)
      } else {
        // On desktop, restore to expanded unless user explicitly collapsed
        setCollapsed(userPreference === true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [userPreference])

  const handleSetCollapsed = React.useCallback((value: boolean) => {
    setCollapsed(value)
    setUserPreference(value)
    localStorage.setItem('sidebar-collapsed', String(value))
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed: handleSetCollapsed, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarFrameProps {
  children: React.ReactNode
}

function SidebarFrame({ children }: SidebarFrameProps) {
  const { collapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-(--z-modal-backdrop) h-screen bg-sidebar border-r border-sidebar-border transition-all duration-(--duration-slow) ease-in-out',
        collapsed ? 'w-(--sidebar-width-collapsed)' : 'w-(--sidebar-width)'
      )}
    >
      <div className="flex h-full flex-col">
        {children}
      </div>
    </aside>
  )
}

function SidebarHeader() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <div className="flex h-(--header-height) items-center justify-between px-(--space-lg) border-b border-sidebar-border">
      <div className={cn('flex items-center gap-(--form-item-gap) overflow-hidden transition-opacity duration-(--duration-slow)', collapsed && 'opacity-0')}>
        <Layers className="size-(--icon-lg) text-sidebar-primary shrink-0" />
        <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
          Embeddings
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-(--button-height-sm) shrink-0"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="size-(--icon-sm)" />
        ) : (
          <ChevronLeft className="size-(--icon-sm)" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </div>
  )
}

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  section?: string
}

const navItems: NavItem[] = [
  { href: '/', icon: <Activity className="size-(--icon-sm)" />, label: 'Server Status', section: 'Monitoring' },
  { href: '/metrics', icon: <BarChart3 className="size-(--icon-sm)" />, label: 'Metrics' },
  { href: '/text-embedding', icon: <FileText className="size-(--icon-sm)" />, label: 'Text Embedding', section: 'Services' },
  { href: '/image-embedding', icon: <Image className="size-(--icon-sm)" />, label: 'Image Embedding' },
  { href: '/search', icon: <Search className="size-(--icon-sm)" />, label: 'Hybrid Search' },
  { href: '/records', icon: <Database className="size-(--icon-sm)" />, label: 'Records', section: 'Data' },
  { href: '/graph', icon: <GitBranch className="size-(--icon-sm)" />, label: 'Graph' },
  { href: '/users', icon: <Users className="size-(--icon-sm)" />, label: 'Users', section: 'Admin' },
]

function SidebarNav() {
  const { collapsed } = useSidebar()
  const pathname = usePathname()

  const groupedItems = React.useMemo(() => {
    const groups: { section: string; items: NavItem[] }[] = []
    let currentSection = ''

    navItems.forEach((item) => {
      if (item.section) {
        currentSection = item.section
        groups.push({ section: item.section, items: [item] })
      } else if (groups.length > 0) {
        groups[groups.length - 1].items.push(item)
      }
    })

    return groups
  }, [])

  return (
    <ScrollArea className="flex-1 px-(--space-sm) py-(--space-lg)">
      <nav className="space-y-(--space-lg)">
        {groupedItems.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <h4 className="mb-(--form-item-gap) px-(--space-sm) text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.section}
              </h4>
            )}
            <div className="space-y-(--dropdown-gap)">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-(--sidebar-item-gap) rounded-md px-(--sidebar-item-padding-x) py-(--sidebar-item-padding-y) text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                      collapsed && 'justify-center px-(--space-sm)'
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
              })}
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>
  )
}

function SidebarFooter() {
  const { collapsed } = useSidebar()

  return (
    <div className="border-t border-sidebar-border p-(--space-md)">
      <AccountMenu collapsed={collapsed} />
    </div>
  )
}

export {
  SidebarProvider,
  SidebarFrame,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
  useSidebar,
}
