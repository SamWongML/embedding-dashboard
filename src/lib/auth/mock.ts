import type { AccountSnapshot, WorkspaceSummary } from '@/lib/types/account'

const now = new Date().toISOString()

const workspaces: WorkspaceSummary[] = [
  {
    id: 'ws-main',
    name: 'Embedding Lab',
    slug: 'embedding-lab',
    plan: 'pro',
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'ws-search',
    name: 'Search Ops',
    slug: 'search-ops',
    plan: 'free',
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'ws-observability',
    name: 'Observability',
    slug: 'observability',
    plan: 'enterprise',
    role: 'member',
    createdAt: now,
    updatedAt: now,
  },
]

export const mockAccountSnapshot: AccountSnapshot = {
  user: {
    id: 'user-1',
    name: 'Avery Chen',
    email: 'avery@embedding.dev',
    avatarUrl: '',
    authProvider: 'mock',
    authUserId: 'mock-user-1',
    createdAt: now,
    updatedAt: now,
  },
  workspaces,
  activeWorkspaceId: workspaces[0].id,
}
