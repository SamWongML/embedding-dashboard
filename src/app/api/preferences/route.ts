import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getPreferencesSupabase, upsertPreferencesSupabase } from '@/lib/account/supabase'

export const runtime = 'nodejs'

const defaultPreferences = {
  theme: 'system',
  locale: null,
  timezone: null,
  active_workspace_id: null,
}

function getAuthMode() {
  const mode = process.env.AUTH_MODE || process.env.NEXT_PUBLIC_AUTH_MODE || 'mock'
  if (mode === 'supabase' || mode === 'mock') {
    return mode
  }
  return 'mock'
}

export async function GET() {
  const authMode = getAuthMode()

  if (authMode === 'supabase') {
    const supabase = await getSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json(defaultPreferences)
    }

    const preferences = await getPreferencesSupabase(supabase, authData.user)
    return NextResponse.json(preferences ?? defaultPreferences)
  }

  return NextResponse.json(defaultPreferences)
}

export async function POST(request: Request) {
  const authMode = getAuthMode()
  const body = await request.json().catch(() => ({}))

  if (authMode === 'supabase') {
    const supabase = await getSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await upsertPreferencesSupabase(supabase, authData.user, {
      theme: body.theme,
      locale: body.locale,
      timezone: body.timezone,
      active_workspace_id: body.active_workspace_id,
    })

    return NextResponse.json(preferences)
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
