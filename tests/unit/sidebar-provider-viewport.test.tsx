import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SidebarViewportMode } from '@/lib/layout/sidebar-mode'

let viewportMode: SidebarViewportMode = 'extended'

vi.mock('@/hooks/use-sidebar-viewport-mode', () => ({
  useSidebarViewportMode: () => viewportMode,
}))

import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'

function SidebarStateProbe() {
  const { state, viewportMode: currentViewportMode, setOpen } = useSidebar()

  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="mode">{currentViewportMode}</span>
      <button type="button" onClick={() => setOpen(true)}>
        Expand
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <SidebarProvider>
      <SidebarStateProbe />
    </SidebarProvider>
  )
}

describe('SidebarProvider viewport behavior', () => {
  beforeEach(() => {
    viewportMode = 'extended'
  })

  it('defaults to collapsed in medium viewport', async () => {
    viewportMode = 'medium'
    renderProbe()

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })
    expect(screen.getByTestId('mode')).toHaveTextContent('medium')
  })

  it('keeps temporary user expansion in medium until viewport mode changes', async () => {
    viewportMode = 'medium'
    const { rerender } = renderProbe()

    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')

    rerender(
      <SidebarProvider>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')

    viewportMode = 'extended'
    rerender(
      <SidebarProvider>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    })

    viewportMode = 'medium'
    rerender(
      <SidebarProvider>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })
  })
})
