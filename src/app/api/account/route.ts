import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { AccountSnapshot, WorkspaceSummary } from '@/lib/types/account'

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>

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

async function ensureUserRow(
  supabase: SupabaseServerClient,
  authUser: NonNullable<Awaited<ReturnType<SupabaseServerClient['auth']['getUser']>>['data']['user']>
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
    .select(
      'role, workspaces(id, name, slug, plan, created_at, updated_at)'
    )
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

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRow = await ensureUserRow(supabase, authData.user)
  const memberships = await ensureWorkspaceMembership(supabase, userRow.id)
  const workspaces = mapWorkspaces(memberships)
  const preferences = await ensurePreferences(supabase, userRow.id, workspaces[0].id)

  const activeWorkspaceId =
    preferences?.active_workspace_id && workspaces.some((ws) => ws.id === preferences.active_workspace_id)
      ? preferences.active_workspace_id
      : workspaces[0].id

  const response: AccountSnapshot = {
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

  return NextResponse.json(response)
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const workspaceId = body.activeWorkspaceId || body.active_workspace_id

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle()

  if (!userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', userRow.id)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
