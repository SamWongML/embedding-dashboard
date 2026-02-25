import { NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server'
import { maskEmailForAudit, recordAdminEvent } from '@/lib/audit/admin-events'
import { resolveActiveWorkspaceAdminContext } from '@/lib/auth/admin-access'
import { validateSameOriginRequest } from '@/lib/api/csrf'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const originValidation = validateSameOriginRequest(request)
  const supabase = await getSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()
  const actorAuthUserId = authData.user?.id ?? null

  if (!authData.user) {
    recordAdminEvent({
      action: 'admin.invite.denied',
      outcome: 'deny',
      actorAuthUserId,
      metadata: { reason: 'unauthenticated' },
    })

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!originValidation.isValid) {
    recordAdminEvent({
      action: 'admin.invite.denied',
      outcome: 'deny',
      actorAuthUserId,
      metadata: {
        reason: 'same_origin_failed',
        expectedOrigin: originValidation.expectedOrigin,
        providedOrigin: originValidation.providedOrigin,
        validationReason: originValidation.reason,
      },
    })

    return NextResponse.json(
      { error: 'Forbidden: Invalid request origin' },
      { status: 403 }
    )
  }

  const adminContext = await resolveActiveWorkspaceAdminContext(supabase, authData.user)

  if (!adminContext.isWorkspaceAdmin) {
    recordAdminEvent({
      action: 'admin.invite.denied',
      outcome: 'deny',
      actorAuthUserId,
      actorUserId: adminContext.snapshot.user.id,
      workspaceId: adminContext.activeWorkspaceId,
      metadata: {
        reason: 'insufficient_workspace_role',
        workspaceRole: adminContext.activeWorkspace?.role ?? null,
      },
    })

    return NextResponse.json(
      { error: 'Forbidden: Admin access required for the active workspace' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const email = typeof body.email === 'string' ? body.email : null

  if (!email) {
    recordAdminEvent({
      action: 'admin.invite.denied',
      outcome: 'deny',
      actorAuthUserId,
      actorUserId: adminContext.snapshot.user.id,
      workspaceId: adminContext.activeWorkspaceId,
      metadata: { reason: 'missing_email' },
    })

    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    recordAdminEvent({
      action: 'admin.invite.denied',
      outcome: 'deny',
      actorAuthUserId,
      actorUserId: adminContext.snapshot.user.id,
      workspaceId: adminContext.activeWorkspaceId,
      metadata: {
        reason: 'invalid_email_format',
        targetEmail: maskEmailForAudit(email),
      },
    })

    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  recordAdminEvent({
    action: 'admin.invite.requested',
    outcome: 'allow',
    actorAuthUserId,
    actorUserId: adminContext.snapshot.user.id,
    workspaceId: adminContext.activeWorkspaceId,
    metadata: { targetEmail: maskEmailForAudit(email) },
  })

  try {
    const serviceClient = getSupabaseServiceClient()

    const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
    })

    if (error) {
      recordAdminEvent({
        action: 'admin.invite.failed',
        outcome: 'error',
        actorAuthUserId,
        actorUserId: adminContext.snapshot.user.id,
        workspaceId: adminContext.activeWorkspaceId,
        metadata: {
          targetEmail: maskEmailForAudit(email),
          message: error.message,
        },
      })

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    recordAdminEvent({
      action: 'admin.invite.sent',
      outcome: 'allow',
      actorAuthUserId,
      actorUserId: adminContext.snapshot.user.id,
      workspaceId: adminContext.activeWorkspaceId,
      metadata: { targetEmail: maskEmailForAudit(email) },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invite' },
      { status: 500 }
    )
  }
}
