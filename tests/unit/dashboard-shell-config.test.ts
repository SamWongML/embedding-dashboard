import { describe, expect, it } from "vitest"
import { resolveDashboardShellRouteConfig } from "@/components/dashboard/layout/dashboard-shell-config"

describe("resolveDashboardShellRouteConfig", () => {
  it("returns the matching config for known dashboard routes", () => {
    expect(resolveDashboardShellRouteConfig("/records").title).toBe(
      "Embedding Records"
    )

    const workspaceConfig = resolveDashboardShellRouteConfig("/admin/workspace")
    expect(workspaceConfig.title).toBe("Workspace Administration")

    const settingsConfig = resolveDashboardShellRouteConfig("/settings")
    expect(settingsConfig.title).toBe("Settings")
    expect(settingsConfig.className).toBe("settings-typography")
  })

  it("normalizes trailing slashes", () => {
    expect(resolveDashboardShellRouteConfig("/metrics/").title).toBe(
      "Usage Analytics"
    )
  })

  it("returns the default config for unknown routes", () => {
    expect(resolveDashboardShellRouteConfig("/unknown/path").title).toBe(
      "Knowledge Base Studio"
    )
  })
})
