export type AdminAuditAction =
  | 'admin.invite.requested'
  | 'admin.invite.denied'
  | 'admin.invite.sent'
  | 'admin.invite.failed'

export type AdminAuditOutcome = 'allow' | 'deny' | 'error'

export interface AdminAuditEvent {
  action: AdminAuditAction
  outcome: AdminAuditOutcome
  actorAuthUserId?: string | null
  actorUserId?: string | null
  workspaceId?: string | null
  metadata?: Record<string, unknown>
  occurredAt: string
}

export function maskEmailForAudit(email: string) {
  const [localPart, domain = 'unknown'] = email.split('@')
  if (!localPart) {
    return `***@${domain}`
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}*@${domain}`
  }

  return `${localPart.slice(0, 2)}***@${domain}`
}

export function recordAdminEvent(
  event: Omit<AdminAuditEvent, 'occurredAt'>
): AdminAuditEvent {
  const payload: AdminAuditEvent = {
    ...event,
    occurredAt: new Date().toISOString(),
  }

  console.info('[admin-audit]', JSON.stringify(payload))

  return payload
}
