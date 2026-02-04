import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>

const defaultPreferences = {
  theme: 'system',
  locale: null,
  timezone: null,
  active_workspace_id: null,
}

async function ensureUserId(
  supabase: SupabaseServerClient,
  authUser: NonNullable<Awaited<ReturnType<SupabaseServerClient['auth']['getUser']>>['data']['user']>
) {
  const { data: userRow } = await supabase
    .from('users')
    .select('id, email')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (userRow) {
    return userRow.id
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
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingByEmail) {
    await supabase
      .from('users')
      .update({
        auth_provider: 'supabase',
        auth_user_id: authUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingByEmail.id)

    return existingByEmail.id
  }

  const { data: inserted } = await supabase
    .from('users')
    .insert({
      auth_provider: 'supabase',
      auth_user_id: authUser.id,
      name,
      email,
      avatar_url: avatarUrl,
    })
    .select('id')
    .single()

  return inserted?.id
}

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json(defaultPreferences)
  }

  const userId = await ensureUserId(supabase, authData.user)

  if (!userId) {
    return NextResponse.json(defaultPreferences)
  }

  const { data: preferences } = await supabase
    .from('preferences')
    .select('theme, locale, timezone, active_workspace_id')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json(preferences ?? defaultPreferences)
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = await ensureUserId(supabase, authData.user)

  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))

  const payload = {
    user_id: userId,
    theme: body.theme ?? 'system',
    locale: body.locale ?? null,
    timezone: body.timezone ?? null,
    active_workspace_id: body.active_workspace_id ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data: preferences, error } = await supabase
    .from('preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select('theme, locale, timezone, active_workspace_id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(preferences)
}
