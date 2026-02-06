import { describe, expect, it } from 'vitest'
import {
  getAccountSnapshotSupabase,
  getPreferencesSupabase,
  setActiveWorkspaceSupabase,
  upsertPreferencesSupabase,
} from '@/lib/account/supabase'

function createSupabaseStub(queues: Record<string, Record<string, any[]>>) {
  const dequeue = (table: string, op: string) => {
    const queue = queues[table]?.[op] ?? []
    return queue.shift()
  }

  const createBuilder = (table: string) => {
    let op = 'select'

    const builder: any = {
      select: () => builder,
      insert: () => {
        op = 'insert'
        return builder
      },
      update: () => {
        op = 'update'
        return builder
      },
      upsert: () => {
        op = 'upsert'
        return builder
      },
      eq: () => builder,
      maybeSingle: async () => ({ data: dequeue(table, op) ?? null }),
      single: async () => {
        const value = dequeue(table, op)
        if (value?.error) {
          return { data: null, error: value.error }
        }
        return { data: value ?? null, error: null }
      },
      then: (resolve: (value: any) => unknown) =>
        Promise.resolve({ data: dequeue(table, op) ?? null }).then(resolve),
    }

    return builder
  }

  return {
    from: (table: string) => createBuilder(table),
  }
}

const authUser = {
  id: 'auth-user-1',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
}

describe('supabase account helpers', () => {
  it('builds account snapshot for existing user', async () => {
    const userRow = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    const memberships = [
      {
        role: 'owner',
        workspaces: {
          id: 'ws-1',
          name: 'Personal',
          slug: 'personal',
          plan: 'free',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
      },
    ]
    const preferences = {
      theme: 'system',
      locale: null,
      timezone: null,
      active_workspace_id: 'ws-1',
    }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      workspace_members: { select: [memberships] },
      preferences: { select: [preferences] },
    })

    const snapshot = await getAccountSnapshotSupabase(supabase as any, authUser as any)

    expect(snapshot.user.id).toBe('user-1')
    expect(snapshot.workspaces).toHaveLength(1)
    expect(snapshot.activeWorkspaceId).toBe('ws-1')
  })

  it('creates workspace when membership is missing', async () => {
    const userRow = {
      id: 'user-2',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    const workspace = {
      id: 'ws-2',
      name: 'Personal',
      slug: 'personal-user',
      plan: 'free',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    const member = {
      role: 'owner',
      workspaces: workspace,
    }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      workspace_members: { select: [[]], insert: [member] },
      workspaces: { insert: [workspace] },
      preferences: { select: [null], insert: [{ theme: 'system', active_workspace_id: 'ws-2' }] },
    })

    const snapshot = await getAccountSnapshotSupabase(supabase as any, authUser as any)

    expect(snapshot.workspaces[0].id).toBe('ws-2')
    expect(snapshot.activeWorkspaceId).toBe('ws-2')
  })

  it('updates user when found by email', async () => {
    const existingByEmail = {
      id: 'user-3',
      name: 'Existing User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'old-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    const updated = { ...existingByEmail, auth_user_id: 'auth-user-1' }
    const memberships = [
      {
        role: 'owner',
        workspaces: {
          id: 'ws-3',
          name: 'Personal',
          slug: 'personal',
          plan: 'free',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
      },
    ]

    const supabase = createSupabaseStub({
      users: { select: [null, existingByEmail], update: [updated] },
      workspace_members: { select: [memberships] },
      preferences: { select: [null], insert: [{ theme: 'system', active_workspace_id: 'ws-3' }] },
    })

    const snapshot = await getAccountSnapshotSupabase(supabase as any, authUser as any)
    expect(snapshot.user.authUserId).toBe('auth-user-1')
  })

  it('inserts user when none exists', async () => {
    const inserted = {
      id: 'user-8',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const memberships = [
      {
        role: 'owner',
        workspaces: {
          id: 'ws-8',
          name: 'Personal',
          slug: 'personal',
          plan: 'free',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
      },
    ]

    const supabase = createSupabaseStub({
      users: { select: [null, null], insert: [inserted] },
      workspace_members: { select: [memberships] },
      preferences: { select: [null], insert: [{ theme: 'system', active_workspace_id: 'ws-8' }] },
    })

    const snapshot = await getAccountSnapshotSupabase(supabase as any, authUser as any)
    expect(snapshot.user.id).toBe('user-8')
  })

  it('sets active workspace when membership exists', async () => {
    const userRow = {
      id: 'user-4',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }
    const membership = { id: 'member-1' }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      workspace_members: { select: [membership] },
      preferences: { upsert: [true] },
    })

    await expect(
      setActiveWorkspaceSupabase(supabase as any, authUser as any, 'ws-1')
    ).resolves.toBeUndefined()
  })

  it('throws when setting active workspace without membership', async () => {
    const userRow = {
      id: 'user-5',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      workspace_members: { select: [null] },
    })

    await expect(
      setActiveWorkspaceSupabase(supabase as any, authUser as any, 'ws-missing')
    ).rejects.toThrow('Forbidden')
  })

  it('returns preferences for user', async () => {
    const userRow = {
      id: 'user-6',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const preferences = {
      theme: 'dark',
      locale: 'en',
      timezone: 'UTC',
      active_workspace_id: 'ws-1',
    }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      preferences: { select: [preferences] },
    })

    const result = await getPreferencesSupabase(supabase as any, authUser as any)
    expect(result?.theme).toBe('dark')
  })

  it('upserts preferences', async () => {
    const userRow = {
      id: 'user-7',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      auth_provider: 'supabase',
      auth_user_id: 'auth-user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const supabase = createSupabaseStub({
      users: { select: [userRow] },
      preferences: {
        upsert: [
          {
            theme: 'light',
            locale: null,
            timezone: null,
            active_workspace_id: 'ws-1',
          },
        ],
      },
    })

    const result = await upsertPreferencesSupabase(supabase as any, authUser as any, {
      theme: 'light',
      active_workspace_id: 'ws-1',
    })

    expect(result.theme).toBe('light')
  })
})
