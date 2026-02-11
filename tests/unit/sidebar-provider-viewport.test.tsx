import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SidebarViewportMode } from '@/lib/layout/sidebar-mode'

let viewportMode: SidebarViewportMode = 'extended'
let isMobile = false

vi.mock('@/hooks/use-sidebar-viewport-mode', () => ({
  useSidebarViewportMode: () => viewportMode,
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => isMobile,
}))

import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'

function SidebarStateProbe() {
  const { state, viewportMode: currentViewportMode, setOpen, toggleSidebar, openMobile } =
    useSidebar()

  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="mode">{currentViewportMode}</span>
      <span data-testid="mobile-open">{String(openMobile)}</span>
      <button type="button" onClick={() => setOpen(true)}>
        Expand
      </button>
      <button type="button" onClick={toggleSidebar}>
        Toggle
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
    isMobile = false
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

  it('resets mobile sheet open state when switching limited -> medium -> limited', async () => {
    viewportMode = 'limited'
    isMobile = true
    const { rerender } = renderProbe({ defaultOpen: false })

    expect(screen.getByTestId('mobile-open')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByTestId('mobile-open')).toHaveTextContent('true')

    viewportMode = 'medium'
    isMobile = false
    rerender(
      <SidebarProvider defaultOpen={false}>
        <SidebarStateProbe />
      </SidebarProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('mobile-open')).toHaveTextContent('false')
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })

    viewportMode = 'limited'
    isMobile = true
    rerender(
      <SidebarProvider defaultOpen={false}>
        <SidebarStateProbe />
      </SidebarProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('mobile-open')).toHaveTextContent('false')
    })
  })
})
