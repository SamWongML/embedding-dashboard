import type { ReactNode } from "react"
import { CommandPalette } from "@/components/dashboard/command-palette"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <header className="sticky top-0 z-(--z-fixed) flex h-(--header-height) items-center justify-between border-b border-border bg-background/95 px-(--header-padding-x) backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-w-0 items-center gap-(--form-item-gap)">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-(--form-item-gap) data-[orientation=vertical]:h-4" />
          <h1 className="truncate text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-(--form-item-gap)">
          {showCommandPalette ? <CommandPalette /> : null}
          {actions}
        </div>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
