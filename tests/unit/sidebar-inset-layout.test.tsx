import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

describe("Sidebar shell layout", () => {
  it("uses min-w-0 on SidebarInset and keeps sidebar above sticky header layer", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent />
        </Sidebar>
        <SidebarInset>Panel content</SidebarInset>
      </SidebarProvider>
    )

    const sidebarContainer = container.querySelector(
      '[data-slot="sidebar-container"]'
    )
    const sidebarInset = container.querySelector('[data-slot="sidebar-inset"]')

    expect(sidebarContainer).not.toBeNull()
    expect(sidebarContainer).toHaveClass("z-(--z-fixed)")

    expect(sidebarInset).not.toBeNull()
    expect(sidebarInset).toHaveClass("min-w-0")
    expect(sidebarInset).not.toHaveClass("w-full")
  })
})

