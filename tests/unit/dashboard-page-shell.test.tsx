import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { useMemo, type ReactNode } from 'react'
import { useDashboardPageHeaderActions } from '@/components/dashboard/layout/dashboard-page-header-context'
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
        actions={<button type="button">Topbar Action</button>}
        showCommandPalette={false}
      >
        <div>Panel content</div>
      </DashboardPageShell>
    )

    const pageHeading = screen.getByRole('heading', { name: 'Metrics' })
    expect(pageHeading).toBeInTheDocument()
    expect(screen.getByText('Topbar Action')).toBeInTheDocument()
    expect(screen.getByText('Panel content')).toBeInTheDocument()

    const stickyTopbar = container.querySelector('header')
    expect(stickyTopbar).not.toBeNull()
    expect(stickyTopbar).toHaveClass('z-(--z-sticky)')
    expect(stickyTopbar).toHaveClass('shrink-0')
    expect(within(stickyTopbar as HTMLElement).queryByRole('heading', { name: 'Metrics' })).toBeNull()
    expect(pageHeading.closest('header')).toBeNull()

    const shellRoot = stickyTopbar?.parentElement
    expect(shellRoot).not.toBeNull()
    expect(shellRoot).toHaveClass('min-w-0')

    const contentRegion = stickyTopbar?.nextElementSibling
    expect(contentRegion).not.toBeNull()
    expect(contentRegion).toHaveClass('min-h-0')
    expect(contentRegion).toHaveClass('min-w-0')

    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' })
    expect(trigger).toHaveClass('md:hidden')

    const headingRow = container.querySelector('[data-slot="page-heading-row"]')
    expect(headingRow).not.toBeNull()
    expect(headingRow).toHaveClass('items-center')
    expect(headingRow).toHaveClass('justify-between')
    expect(headingRow).toHaveClass('flex-nowrap')
    expect(headingRow).toHaveClass('gap-(--page-heading-row-gap)')
    expect(headingRow).not.toHaveClass('flex-col')
    expect(headingRow).not.toHaveClass('sm:flex-row')

    const headingTitle = screen.getByRole('heading', { name: 'Metrics' })
    expect(headingTitle).toHaveClass('flex-1')
    expect(headingTitle).toHaveClass('min-w-0')
    expect(headingTitle).toHaveClass('truncate')

    const actionsContainer = container.querySelector('[data-slot="page-heading-actions"]')
    expect(actionsContainer).not.toBeNull()
    expect(actionsContainer).toHaveClass('min-h-(--page-heading-actions-min-height)')
    expect(actionsContainer).toHaveClass('w-auto')
    expect(actionsContainer).toHaveClass('shrink-0')
    expect(actionsContainer).toHaveClass('invisible')
    expect(actionsContainer).toHaveClass('pointer-events-none')
    expect(actionsContainer).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders page heading actions registered by children', () => {
    function HeaderActionsRegistration() {
      const headerAction = useMemo(
        () => <button type="button">Header Action</button>,
        []
      )
      useDashboardPageHeaderActions(headerAction)
      return null
    }

    const { container } = renderWithSidebarProvider(
      <DashboardPageShell title="Usage Analytics" showCommandPalette={false}>
        <>
          <HeaderActionsRegistration />
          <div>Panel content</div>
        </>
      </DashboardPageShell>
    )

    const actionButton = screen.getByRole('button', { name: 'Header Action' })
    const actionsContainer = container.querySelector('[data-slot="page-heading-actions"]')

    expect(actionsContainer).not.toBeNull()
    expect(actionsContainer).toHaveClass('min-h-(--page-heading-actions-min-height)')
    expect(actionsContainer).toHaveClass('w-auto')
    expect(actionsContainer).toHaveClass('shrink-0')
    expect(actionsContainer).toHaveClass('visible')
    expect(actionsContainer).toHaveClass('pointer-events-auto')
    expect(actionsContainer).toHaveAttribute('aria-hidden', 'false')
    expect(actionsContainer).toContainElement(actionButton)
  })
})
