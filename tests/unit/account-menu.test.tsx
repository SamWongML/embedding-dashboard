import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const setActiveWorkspace = vi.fn()
const signOut = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/hooks/use-account', () => ({
  useAccount: () => ({
    user: {
      id: 'user_1',
      name: 'Avery Chen',
      email: 'avery@example.com',
      authProvider: 'mock',
      authUserId: 'auth_user_1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    status: 'authenticated',
    workspaces: [
      {
        id: 'workspace_1',
        name: 'Embedding Lab',
        slug: 'embedding-lab',
        plan: 'pro',
        role: 'owner',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    activeWorkspaceId: 'workspace_1',
    activeWorkspace: {
      id: 'workspace_1',
      name: 'Embedding Lab',
      slug: 'embedding-lab',
      plan: 'pro',
      role: 'owner',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    setActiveWorkspace,
    signOut,
  }),
}))

import { AccountMenu } from '@/components/account/account-menu'

describe('AccountMenu responsive trigger behavior', () => {
  it('keeps full trigger content in limited viewport even when collapsed state is true', () => {
    render(<AccountMenu collapsed viewportMode="limited" />)

    expect(screen.getByText('Avery Chen')).toBeInTheDocument()
    expect(screen.getByText('Embedding Lab')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open account menu/i }).className).not.toContain(
      'size-(--button-height-sm)'
    )
  })

  it('uses compact trigger in medium viewport when collapsed', () => {
    render(<AccountMenu collapsed viewportMode="medium" />)

    expect(screen.queryByText('Avery Chen')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open account menu/i }).className).toContain(
      'size-(--button-height-sm)'
    )
  })
})
