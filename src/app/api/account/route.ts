import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getAccountSnapshotSupabase, setActiveWorkspaceSupabase } from '@/lib/account/supabase'

export const runtime = 'nodejs'

const AUTH_REQUIRED = process.env.AUTH_REQUIRED === 'true'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const snapshot = await getAccountSnapshotSupabase(supabase, authData.user)
    return NextResponse.json(snapshot)
  }

  if (AUTH_REQUIRED) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: Request) {
  const authMode = getAuthMode()
  const body = await request.json().catch(() => ({}))
  const workspaceId = body.activeWorkspaceId || body.active_workspace_id

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 })
  }

  if (authMode === 'supabase') {
    const supabase = await getSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await setActiveWorkspaceSupabase(supabase, authData.user, workspaceId)
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 403 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
