import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AccountSnapshot } from '@/lib/types/account'

const getAccountSnapshotSupabaseMock = vi.fn()

vi.mock('@/lib/account/supabase', () => ({
  getAccountSnapshotSupabase: (
    ...args: Parameters<typeof getAccountSnapshotSupabaseMock>
  ) => getAccountSnapshotSupabaseMock(...args),
}))

import {
  isLocalAdminBypassEnabled,
  shouldEnforceWorkspaceAdminAccess,
  isWorkspaceAdminRole,
  resolveActiveWorkspaceAdminContext,
} from '@/lib/auth/admin-access'

function createSnapshot(role: 'owner' | 'admin' | 'member' | 'viewer'): AccountSnapshot {
  return {
    user: {
      id: 'user-1',
      name: 'Avery Chen',
      email: 'avery@example.com',
      authProvider: 'supabase',
      authUserId: 'auth-user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    workspaces: [
      {
        id: 'workspace-1',
        name: 'Engineering',
        slug: 'engineering',
        plan: 'pro',
        role,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    activeWorkspaceId: 'workspace-1',
  }
}

describe('admin access helpers', () => {
  beforeEach(() => {
    getAccountSnapshotSupabaseMock.mockReset()
  })

  it('identifies workspace admin roles', () => {
    expect(isWorkspaceAdminRole('owner')).toBe(true)
    expect(isWorkspaceAdminRole('admin')).toBe(true)
    expect(isWorkspaceAdminRole('member')).toBe(false)
    expect(isWorkspaceAdminRole('viewer')).toBe(false)
    expect(isWorkspaceAdminRole(undefined)).toBe(false)
  })

  it('resolves active workspace context as admin when role is owner/admin', async () => {
    getAccountSnapshotSupabaseMock.mockResolvedValue(createSnapshot('admin'))

    const context = await resolveActiveWorkspaceAdminContext(
      {} as never,
      {} as never
    )

    expect(context.activeWorkspace?.id).toBe('workspace-1')
    expect(context.isWorkspaceAdmin).toBe(true)
  })

  it('resolves active workspace context as non-admin when role is not privileged', async () => {
    getAccountSnapshotSupabaseMock.mockResolvedValue(createSnapshot('viewer'))

    const context = await resolveActiveWorkspaceAdminContext(
      {} as never,
      {} as never
    )

    expect(context.activeWorkspace?.role).toBe('viewer')
    expect(context.isWorkspaceAdmin).toBe(false)
  })

  it('enables local bypass in demo mode outside production by default', () => {
    const env = {
      NODE_ENV: 'development',
      AUTH_MODE: 'supabase',
      NEXT_PUBLIC_DATA_MODE: 'demo',
    }

    expect(isLocalAdminBypassEnabled(env)).toBe(true)
    expect(shouldEnforceWorkspaceAdminAccess(env)).toBe(false)
  })

  it('enforces admin access in supabase api mode by default', () => {
    const env = {
      NODE_ENV: 'development',
      AUTH_MODE: 'supabase',
      NEXT_PUBLIC_DATA_MODE: 'api',
    }

    expect(isLocalAdminBypassEnabled(env)).toBe(false)
    expect(shouldEnforceWorkspaceAdminAccess(env)).toBe(true)
  })

  it('supports explicit local bypass flags in non-production', () => {
    const env = {
      NODE_ENV: 'development',
      AUTH_MODE: 'supabase',
      NEXT_PUBLIC_DATA_MODE: 'api',
      ADMIN_AUTHZ_LOCAL_BYPASS: 'true',
    }

    expect(isLocalAdminBypassEnabled(env)).toBe(true)
    expect(shouldEnforceWorkspaceAdminAccess(env)).toBe(false)
  })

  it('supports force-override to disable local bypass', () => {
    const env = {
      NODE_ENV: 'development',
      AUTH_MODE: 'supabase',
      NEXT_PUBLIC_DATA_MODE: 'demo',
      ADMIN_AUTHZ_LOCAL_BYPASS_FORCE: 'false',
    }

    expect(isLocalAdminBypassEnabled(env)).toBe(false)
    expect(shouldEnforceWorkspaceAdminAccess(env)).toBe(true)
  })

  it('never enables bypass in production', () => {
    const env = {
      NODE_ENV: 'production',
      AUTH_MODE: 'supabase',
      NEXT_PUBLIC_DATA_MODE: 'demo',
      ADMIN_AUTHZ_LOCAL_BYPASS: 'true',
      ADMIN_AUTHZ_LOCAL_BYPASS_FORCE: 'true',
    }

    expect(isLocalAdminBypassEnabled(env)).toBe(false)
    expect(shouldEnforceWorkspaceAdminAccess(env)).toBe(true)
  })
})
