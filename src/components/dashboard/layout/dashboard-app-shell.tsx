"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { DashboardPageShell } from "@/components/dashboard/layout/dashboard-page-shell"
import { resolveDashboardShellRouteConfig } from "@/components/dashboard/layout/dashboard-shell-config"

interface DashboardAppShellProps {
  children: ReactNode
}

export function DashboardAppShell({ children }: DashboardAppShellProps) {
  const pathname = usePathname()
  const routeConfig = resolveDashboardShellRouteConfig(pathname)

  return (
    <DashboardPageShell
      title={routeConfig.title}
      className={routeConfig.className}
      showCommandPalette={routeConfig.showCommandPalette}
    >
      {children}
    </DashboardPageShell>
  )
}

