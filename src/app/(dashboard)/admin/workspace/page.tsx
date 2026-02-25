import type { Metadata } from 'next'
import { Lock } from 'lucide-react'
import { WorkspacePanel } from '@/components/dashboard/panels/workspace/workspace-panel'
import {
  resolveActiveWorkspaceAdminContext,
  shouldEnforceWorkspaceAdminAccess,
} from '@/lib/auth/admin-access'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Workspace Administration',
}

function ForbiddenWorkspaceAdminState() {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-destructive/30 bg-card p-8">
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Lock className="size-4" />
      </div>
      <h2 className="typography-heading-3">Admin access required</h2>
      <p className="mt-2 typography-size-sm text-muted-foreground">
        You need an Owner or Admin role in the active workspace to manage workspace
        administration.
      </p>
    </div>
  )
}

export default async function WorkspaceAdminPage() {
  if (!shouldEnforceWorkspaceAdminAccess()) {
    return <WorkspacePanel />
  }

  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return <ForbiddenWorkspaceAdminState />
  }

  const adminContext = await resolveActiveWorkspaceAdminContext(supabase, authData.user)
  if (!adminContext.isWorkspaceAdmin) {
    return <ForbiddenWorkspaceAdminState />
  }

  return <WorkspacePanel />
}
