import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SidebarViewportMode } from '@/lib/layout/sidebar-mode'

let viewportMode: SidebarViewportMode = 'extended'

vi.mock('next/navigation', () => ({
  usePathname: () => '/metrics',
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  } & ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/hooks/use-sidebar-viewport-mode', () => ({
  useSidebarViewportMode: () => viewportMode,
}))

vi.mock('@/components/account/account-menu', () => ({
  AccountMenu: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="account-menu" data-collapsed={String(collapsed)} />
  ),
}))

import { AppSidebar } from '@/components/dashboard/sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

function renderSidebar(
  sidebarProviderProps?: Omit<ComponentProps<typeof SidebarProvider>, 'children'>
) {
  return render(
    <SidebarProvider {...sidebarProviderProps}>
      <AppSidebar />
    </SidebarProvider>
  )
}

describe('AppSidebar responsive behavior', () => {
  beforeEach(() => {
    viewportMode = 'extended'
  })

  it('uses the dashboard logo as a toggle in medium viewport mode', async () => {
    viewportMode = 'medium'
    const { container } = renderSidebar({ defaultOpen: false })

    expect(
      container.querySelector('[data-slot="sidebar"][data-state]')
    ).toHaveAttribute('data-state', 'collapsed')

    const toggleButton = screen.getByRole('button', { name: 'Toggle sidebar' })
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(
        container.querySelector('[data-slot="sidebar"][data-state]')
      ).toHaveAttribute('data-state', 'expanded')
    })
  })

  it('keeps the logo as a home link in extended viewport mode', () => {
    const { container } = renderSidebar()

    expect(screen.queryByRole('button', { name: 'Toggle sidebar' })).toBeNull()
    expect(container.querySelector('[data-sidebar="header"] a[href="/"]')).toBeTruthy()
  })
})
