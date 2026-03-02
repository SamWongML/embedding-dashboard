import type { ReactNode } from "react"
import { CommandPalette } from "@/components/dashboard/command-palette"
import { DevSimulationIndicator } from "@/components/dashboard/layout/dev-simulation-indicator"
import {
  DashboardPageHeaderProvider,
  useDashboardPageHeaderState,
} from "@/components/dashboard/layout/dashboard-page-header-context"
import { PageContentShell } from "@/components/layout/page-content-shell"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface DashboardPageShellProps {
  title: string
  actions?: ReactNode
  showCommandPalette?: boolean
  children: ReactNode
  className?: string
}

export function DashboardPageShell({
  title,
  actions,
  showCommandPalette = true,
  children,
  className,
}: DashboardPageShellProps) {
  return (
    <DashboardPageHeaderProvider>
      <DashboardPageShellContent
        title={title}
        actions={actions}
        showCommandPalette={showCommandPalette}
        className={className}
      >
        {children}
      </DashboardPageShellContent>
    </DashboardPageHeaderProvider>
  )
}

function DashboardPageShellContent({
  title,
  actions,
  showCommandPalette,
  children,
  className,
}: DashboardPageShellProps) {
  const { actions: pageHeaderActions } = useDashboardPageHeaderState()
  const hasPageHeaderActions = pageHeaderActions !== null

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        data-slot="dashboard-scroll-root"
        className="min-h-0 flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
      >
        <header className="sticky top-0 z-(--z-sticky) flex h-(--header-height) shrink-0 items-center border-b border-border/70 bg-background/90 px-(--header-padding-x) backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="ml-auto flex min-w-0 items-center gap-(--form-item-gap)">
            <DevSimulationIndicator />
            {showCommandPalette ? <CommandPalette /> : null}
            {actions}
          </div>
        </header>
        <PageContentShell className="min-h-0 min-w-0 shrink-0">
          <div
            data-slot="page-heading-row"
            className="mb-(--space-page) flex flex-nowrap items-center justify-between gap-(--page-heading-row-gap)"
          >
            <h1 className="flex-1 min-w-0 truncate [font-size:var(--page-title-size)] [line-height:var(--page-title-line-height)] [font-weight:var(--page-title-weight)]">
              {title}
            </h1>
            <div
              data-slot="page-heading-actions"
              aria-hidden={!hasPageHeaderActions}
              className={cn(
                "flex min-h-(--page-heading-actions-min-height) w-auto shrink-0 items-center justify-end",
                hasPageHeaderActions
                  ? "pointer-events-auto visible"
                  : "pointer-events-none invisible"
              )}
            >
              {pageHeaderActions}
            </div>
          </div>
          <div className="min-h-0 min-w-0">{children}</div>
        </PageContentShell>
      </div>
    </div>
  )
}
