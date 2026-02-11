import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DashboardPageShell } from '@/components/dashboard/layout/dashboard-page-shell'
import { SidebarProvider } from '@/components/ui/sidebar'

function renderWithSidebarProvider(ui: ReactNode) {
  return render(
    <SidebarProvider>
      {ui}
    </SidebarProvider>
  )
}

describe('DashboardPageShell', () => {
  it('renders title, actions, and children', () => {
    const { container } = renderWithSidebarProvider(
      <DashboardPageShell
        title="Metrics"
        actions={<button type="button">Action</button>}
        showCommandPalette={false}
      >
        <div>Panel content</div>
      </DashboardPageShell>
    )

    expect(screen.getByText('Metrics')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Panel content')).toBeInTheDocument()

    const header = screen.getByRole('heading', { name: 'Metrics' }).closest('header')
    expect(header).not.toBeNull()
    expect(header).toHaveClass('z-(--z-sticky)')
    expect(header).toHaveClass('shrink-0')

    const shellRoot = header?.parentElement
    expect(shellRoot).not.toBeNull()
    expect(shellRoot).toHaveClass('min-w-0')

    const contentRegion = header?.nextElementSibling
    expect(contentRegion).not.toBeNull()
    expect(contentRegion).toHaveClass('min-h-0')
    expect(contentRegion).toHaveClass('min-w-0')

    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' })
    expect(trigger).toHaveClass('md:hidden')
    expect(trigger).toHaveClass('xl:inline-flex')

    const verticalSeparator = container.querySelector(
      '[data-slot="separator"][data-orientation="vertical"]'
    )
    expect(verticalSeparator).toHaveClass('md:hidden')
    expect(verticalSeparator).toHaveClass('xl:block')
  })
})
