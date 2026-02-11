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
    renderDashboardAppShell(<div>Panel content</div>)

    expect(
      screen.getByRole("heading", { name: "Embedding Records" })
    ).toBeInTheDocument()
    expect(screen.getByText("Panel content")).toBeInTheDocument()

    const header = screen
      .getByRole("heading", { name: "Embedding Records" })
      .closest("header")
    expect(header).not.toBeNull()
    expect(header?.nextElementSibling).not.toBeNull()
  })

  it("applies settings shell classes from route config", () => {
    pathname = "/settings"
    renderDashboardAppShell(<div>Settings content</div>)

    const heading = screen.getByRole("heading", { name: "Settings" })
    const shellRoot = heading.closest("header")?.parentElement

    expect(shellRoot).not.toBeNull()
    expect(shellRoot).toHaveClass("settings-typography")
  })

  it("uses a fallback shell title for unknown routes", () => {
    pathname = "/unknown-path"
    renderDashboardAppShell(<div>Unknown route content</div>)

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument()
  })
})

