import type { AccountSnapshot, WorkspaceSummary } from '@/lib/types/account'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>
export type SupabaseAuthUser = NonNullable<
  Awaited<ReturnType<SupabaseServerClient['auth']['getUser']>>['data']['user']
>

export interface PreferencePayload {
  theme?: 'light' | 'dark' | 'system'
  locale?: string | null
  timezone?: string | null
  active_workspace_id?: string | null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function toIso(value: string | null) {
  return value ?? new Date().toISOString()
}

function sortWorkspaces(workspaces: WorkspaceSummary[]) {
  return [...workspaces].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime()
    const bTime = new Date(b.updatedAt).getTime()
    return bTime - aTime
  })
}

async function ensureUserRow(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser
) {
  const { data: userRow } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, auth_provider, auth_user_id, created_at, updated_at')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (userRow) {
    return userRow
  }

  const email = authUser.email ?? ''
  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    email.split('@')[0] ||
    'User'
  const avatarUrl =
    authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null

  const { data: existingByEmail } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, auth_provider, auth_user_id, created_at, updated_at')
    .eq('email', email)
    .maybeSingle()

  if (existingByEmail) {
    const { data: updated } = await supabase
      .from('users')
      .update({
        auth_provider: 'supabase',
        auth_user_id: authUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingByEmail.id)
      .select('id, name, email, avatar_url, auth_provider, auth_user_id, created_at, updated_at')
      .single()

    return updated ?? existingByEmail
  }

  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      auth_provider: 'supabase',
      auth_user_id: authUser.id,
      name,
      email,
      avatar_url: avatarUrl,
    })
    .select('id, name, email, avatar_url, auth_provider, auth_user_id, created_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return inserted
}

async function ensureWorkspaceMembership(
  supabase: SupabaseServerClient,
  userId: string
) {
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('role, workspaces(id, name, slug, plan, created_at, updated_at)')
    .eq('user_id', userId)

  if (memberships && memberships.length > 0) {
    return memberships
  }

  const personalName = 'Personal'
  const slug = `${slugify(personalName)}-${userId.slice(0, 6)}`

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: personalName,
      slug,
      plan: 'free',
    })
    .select('id, name, slug, plan, created_at, updated_at')
    .single()

  if (workspaceError) {
    throw new Error(workspaceError.message)
  }

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      user_id: userId,
      workspace_id: workspace.id,
      role: 'owner',
    })
    .select('role, workspaces(id, name, slug, plan, created_at, updated_at)')
    .single()

  if (memberError) {
    throw new Error(memberError.message)
  }

  return [member]
}

async function ensurePreferences(
  supabase: SupabaseServerClient,
  userId: string,
  activeWorkspaceId: string
) {
  const { data: preferences } = await supabase
    .from('preferences')
    .select('theme, locale, timezone, active_workspace_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (preferences) {
    if (!preferences.active_workspace_id) {
      await supabase
        .from('preferences')
        .update({
          active_workspace_id: activeWorkspaceId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }
    return preferences
  }

  const { data: inserted } = await supabase
    .from('preferences')
    .insert({
      user_id: userId,
      theme: 'system',
      active_workspace_id: activeWorkspaceId,
    })
    .select('theme, locale, timezone, active_workspace_id')
    .single()

  return inserted
}

function mapWorkspaces(memberships: any[]): WorkspaceSummary[] {
  return memberships.map((membership) => {
    const workspace = membership.workspaces
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
      createdAt: toIso(workspace.created_at),
      updatedAt: toIso(workspace.updated_at),
      role: membership.role,
    }
  })
}

export async function getAccountSnapshotSupabase(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser
): Promise<AccountSnapshot> {
  const userRow = await ensureUserRow(supabase, authUser)
  const memberships = await ensureWorkspaceMembership(supabase, userRow.id)
  const workspaces = sortWorkspaces(mapWorkspaces(memberships))
  const preferences = await ensurePreferences(supabase, userRow.id, workspaces[0].id)

  const activeWorkspaceId =
    preferences?.active_workspace_id && workspaces.some((ws) => ws.id === preferences.active_workspace_id)
      ? preferences.active_workspace_id
      : workspaces[0].id

  return {
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatarUrl: userRow.avatar_url ?? undefined,
      authProvider: userRow.auth_provider,
      authUserId: userRow.auth_user_id,
      createdAt: toIso(userRow.created_at),
      updatedAt: toIso(userRow.updated_at),
    },
    workspaces,
    activeWorkspaceId,
  }
}

export async function setActiveWorkspaceSupabase(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser,
  workspaceId: string
) {
  const userRow = await ensureUserRow(supabase, authUser)

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', userRow.id)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (!membership) {
    throw new Error('Forbidden')
  }

  const { error } = await supabase
    .from('preferences')
    .upsert(
      {
        user_id: userRow.id,
        active_workspace_id: workspaceId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    throw new Error(error.message)
  }
}

export async function getPreferencesSupabase(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser
) {
  const userRow = await ensureUserRow(supabase, authUser)

  const { data: preferences } = await supabase
    .from('preferences')
    .select('theme, locale, timezone, active_workspace_id')
    .eq('user_id', userRow.id)
    .maybeSingle()

  return preferences
}

export async function upsertPreferencesSupabase(
  supabase: SupabaseServerClient,
  authUser: SupabaseAuthUser,
  payload: PreferencePayload
) {
  const userRow = await ensureUserRow(supabase, authUser)

  const { data: preferences, error } = await supabase
    .from('preferences')
    .upsert(
      {
        user_id: userRow.id,
        theme: payload.theme ?? 'system',
        locale: payload.locale ?? null,
        timezone: payload.timezone ?? null,
        active_workspace_id: payload.active_workspace_id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('theme, locale, timezone, active_workspace_id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return preferences
}
