import {
  getAccountSnapshotSupabase,
  type SupabaseAuthUser,
  type SupabaseServerClient,
} from '@/lib/account/supabase'
import type { AccountSnapshot, WorkspaceRole, WorkspaceSummary } from '@/lib/types/account'

export type WorkspaceAdminRole = Extract<WorkspaceRole, 'owner' | 'admin'>

export interface AdminAccessRuntimeEnv {
  AUTH_MODE?: string
  NEXT_PUBLIC_AUTH_MODE?: string
  DATA_MODE?: string
  NEXT_PUBLIC_DATA_MODE?: string
  NODE_ENV?: string
  ADMIN_AUTHZ_LOCAL_BYPASS?: string
  ADMIN_AUTHZ_LOCAL_BYPASS_FORCE?: string
}

export interface ActiveWorkspaceAdminContext {
  snapshot: AccountSnapshot
  activeWorkspace: WorkspaceSummary | null
  activeWorkspaceId: string | null
  isWorkspaceAdmin: boolean
}

function resolveAuthMode(env: AdminAccessRuntimeEnv) {
  const mode = env.AUTH_MODE || env.NEXT_PUBLIC_AUTH_MODE || 'mock'
  if (mode === 'supabase' || mode === 'mock') {
    return mode
  }
  return 'mock'
}

function resolveDataMode(env: AdminAccessRuntimeEnv) {
  const mode = env.DATA_MODE || env.NEXT_PUBLIC_DATA_MODE || 'api'
  if (mode === 'demo' || mode === 'api') {
    return mode
  }
  return 'api'
}

function resolveBooleanFlag(value: string | undefined) {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return null
}

export function isWorkspaceAdminRole(
  role: WorkspaceRole | null | undefined
): role is WorkspaceAdminRole {
  return role === 'owner' || role === 'admin'
}

export function isLocalAdminBypassEnabled(env: AdminAccessRuntimeEnv = process.env) {
  if (env.NODE_ENV === 'production') {
    return false
  }

  const forcedBypass = resolveBooleanFlag(env.ADMIN_AUTHZ_LOCAL_BYPASS_FORCE)
  if (forcedBypass !== null) {
    return forcedBypass
  }

  const explicitBypass = resolveBooleanFlag(env.ADMIN_AUTHZ_LOCAL_BYPASS)
  if (explicitBypass !== null) {
    return explicitBypass
  }

  return resolveDataMode(env) === 'demo'
}

export function shouldEnforceWorkspaceAdminAccess(
  env: AdminAccessRuntimeEnv = process.env
) {
  return resolveAuthMode(env) === 'supabase' && !isLocalAdminBypassEnabled(env)
}

export async function resolveActiveWorkspaceAdminContext(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser
): Promise<ActiveWorkspaceAdminContext> {
  const snapshot = await getAccountSnapshotSupabase(supabase, authUser)
  const activeWorkspace =
    snapshot.workspaces.find((workspace) => workspace.id === snapshot.activeWorkspaceId) ??
    snapshot.workspaces[0] ??
    null

  return {
    snapshot,
    activeWorkspace,
    activeWorkspaceId: activeWorkspace?.id ?? null,
    isWorkspaceAdmin: isWorkspaceAdminRole(activeWorkspace?.role),
  }
}
