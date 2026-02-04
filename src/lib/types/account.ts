export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export type AccountPlan = 'free' | 'pro' | 'enterprise'

export type AuthProvider = 'supabase' | 'authjs' | 'mock'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  authProvider: AuthProvider
  authUserId: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  plan: AccountPlan
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: WorkspaceRole
  createdAt: string
  updatedAt: string
}

export interface WorkspaceInvite {
  id: string
  workspaceId: string
  email: string
  role: WorkspaceRole
  invitedBy: string
  createdAt: string
  expiresAt: string
}

export interface UserPreference {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  locale?: string
  timezone?: string
  createdAt: string
  updatedAt: string
}

export interface AccountSession {
  user: User
  workspace: Workspace
  role: WorkspaceRole
  expiresAt?: string
}

export interface WorkspaceSummary extends Workspace {
  role: WorkspaceRole
}

export interface AccountSnapshot {
  user: User
  workspaces: WorkspaceSummary[]
  activeWorkspaceId: string
}
