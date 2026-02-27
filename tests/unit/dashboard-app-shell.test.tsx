import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

let pathname = "/records"

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}))

vi.mock("@/components/dashboard/command-palette", () => ({
  CommandPalette: () => <div data-testid="command-palette">Command Palette</div>,
}))

import { DashboardAppShell } from "@/components/dashboard/layout/dashboard-app-shell"
import { SidebarProvider } from "@/components/ui/sidebar"

function renderDashboardAppShell(children: ReactNode) {
  return render(
    <SidebarProvider>
      <DashboardAppShell>{children}</DashboardAppShell>
    </SidebarProvider>
  )
}

describe("DashboardAppShell", () => {
  beforeEach(() => {
    pathname = "/records"
  })

  it("renders the route title and keeps shell structure stable", () => {
    const { container } = renderDashboardAppShell(<div>Panel content</div>)

    const heading = screen.getByRole("heading", { name: "Embedding Records" })
    expect(heading).toBeInTheDocument()
    expect(screen.getByText("Panel content")).toBeInTheDocument()

    const topbar = container.querySelector("header")
    expect(topbar).not.toBeNull()
    expect(topbar?.nextElementSibling).not.toBeNull()
    expect(heading.closest("header")).toBeNull()

    const headingRow = heading.closest('[data-slot="page-heading-row"]')
    expect(headingRow).not.toBeNull()
  })

  it("applies settings shell classes from route config", () => {
    pathname = "/settings"
    const { container } = renderDashboardAppShell(<div>Settings content</div>)

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument()
    const shellRoot = container.querySelector('[data-slot="page-heading-row"]')
      ?.closest("div.settings-typography")

    expect(shellRoot).not.toBeNull()
    expect(shellRoot).toHaveClass("settings-typography")
  })

  it("renders workspace administration title for admin workspace route", () => {
    pathname = "/admin/workspace"
    renderDashboardAppShell(<div>Workspace content</div>)

    expect(
      screen.getByRole("heading", { name: "Workspace Administration" })
    ).toBeInTheDocument()
  })

  it("uses a fallback shell title for unknown routes", () => {
    pathname = "/unknown-path"
    renderDashboardAppShell(<div>Unknown route content</div>)

    expect(
      screen.getByRole("heading", { name: "Knowledge Base Studio" })
    ).toBeInTheDocument()
  })
})
