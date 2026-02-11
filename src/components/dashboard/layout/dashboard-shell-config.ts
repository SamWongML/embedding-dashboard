export interface DashboardShellRouteConfig {
  title: string
  className?: string
  showCommandPalette?: boolean
}

const DEFAULT_DASHBOARD_SHELL_ROUTE_CONFIG: DashboardShellRouteConfig = {
  title: "Dashboard",
}

const DASHBOARD_SHELL_ROUTE_CONFIG: Record<string, DashboardShellRouteConfig> = {
  "/": {
    title: "Server Status",
  },
  "/metrics": {
    title: "Metrics",
  },
  "/text-embedding": {
    title: "Text Embedding",
  },
  "/image-embedding": {
    title: "Image Embedding",
  },
  "/search": {
    title: "Hybrid Search",
  },
  "/records": {
    title: "Embedding Records",
  },
  "/graph": {
    title: "Knowledge Graph",
  },
  "/users": {
    title: "User Management",
  },
  "/settings": {
    title: "Settings",
    className: "settings-typography",
  },
}

function normalizeDashboardPath(pathname?: string | null) {
  if (!pathname) {
    return "/"
  }

  if (pathname === "/") {
    return pathname
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}

export function resolveDashboardShellRouteConfig(pathname?: string | null) {
  const normalizedPathname = normalizeDashboardPath(pathname)
  return (
    DASHBOARD_SHELL_ROUTE_CONFIG[normalizedPathname] ??
    DEFAULT_DASHBOARD_SHELL_ROUTE_CONFIG
  )
}

