import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
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

function renderProbe(
  sidebarProviderProps?: Omit<ComponentProps<typeof SidebarProvider>, 'children'>
) {
  return render(
    <SidebarProvider {...sidebarProviderProps}>
      <SidebarStateProbe />
    </SidebarProvider>
  )
}

describe('SidebarProvider viewport behavior', () => {
  beforeEach(() => {
    viewportMode = 'extended'
  })

  it('honors defaultOpen on first render in medium viewport', () => {
    viewportMode = 'medium'
    renderProbe({ defaultOpen: false })

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    expect(screen.getByTestId('mode')).toHaveTextContent('medium')
  })

  it('keeps defaultOpen state on first render in extended viewport', () => {
    viewportMode = 'extended'
    renderProbe({ defaultOpen: false })

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    expect(screen.getByTestId('mode')).toHaveTextContent('extended')
  })

  it('keeps temporary user expansion in medium until viewport mode changes', async () => {
    viewportMode = 'medium'
    const { rerender } = renderProbe({ defaultOpen: false })

    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')

    rerender(
      <SidebarProvider defaultOpen={false}>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')

    viewportMode = 'extended'
    rerender(
      <SidebarProvider defaultOpen={false}>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    })

    viewportMode = 'medium'
    rerender(
      <SidebarProvider defaultOpen={false}>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })
  })
})
