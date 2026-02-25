import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSupabaseServerClientMock = vi.fn()
const getSupabaseServiceClientMock = vi.fn()
const resolveActiveWorkspaceAdminContextMock = vi.fn()
const recordAdminEventMock = vi.fn()
const maskEmailForAuditMock = vi.fn((email: string) => `masked:${email}`)
const validateSameOriginRequestMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => getSupabaseServerClientMock(),
  getSupabaseServiceClient: () => getSupabaseServiceClientMock(),
}))

vi.mock('@/lib/auth/admin-access', () => ({
  resolveActiveWorkspaceAdminContext: (
    ...args: Parameters<typeof resolveActiveWorkspaceAdminContextMock>
  ) => resolveActiveWorkspaceAdminContextMock(...args),
}))

vi.mock('@/lib/audit/admin-events', () => ({
  recordAdminEvent: (...args: Parameters<typeof recordAdminEventMock>) =>
    recordAdminEventMock(...args),
  maskEmailForAudit: (...args: Parameters<typeof maskEmailForAuditMock>) =>
    maskEmailForAuditMock(...args),
}))

vi.mock('@/lib/api/csrf', () => ({
  validateSameOriginRequest: (
    ...args: Parameters<typeof validateSameOriginRequestMock>
  ) => validateSameOriginRequestMock(...args),
}))

import { POST } from '@/app/api/admin/invite/route'

const authenticatedUser = { id: 'auth-user-1' }

function createServerClient(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user,
        },
      }),
    },
  }
}

function createRequest(email: string) {
  return new Request('http://localhost:3000/api/admin/invite', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
}

describe('POST /api/admin/invite', () => {
  beforeEach(() => {
    getSupabaseServerClientMock.mockReset()
    getSupabaseServiceClientMock.mockReset()
    resolveActiveWorkspaceAdminContextMock.mockReset()
    recordAdminEventMock.mockReset()
    maskEmailForAuditMock.mockClear()
    validateSameOriginRequestMock.mockReset()
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    validateSameOriginRequestMock.mockReturnValue({
      isValid: true,
      expectedOrigin: 'http://localhost:3000',
      providedOrigin: 'http://localhost:3000',
      reason: null,
    })
  })

  it('returns 403 when same-origin validation fails', async () => {
    getSupabaseServerClientMock.mockReturnValue(createServerClient(authenticatedUser))
    validateSameOriginRequestMock.mockReturnValue({
      isValid: false,
      expectedOrigin: 'http://localhost:3000',
      providedOrigin: 'https://malicious.example',
      reason: 'origin_mismatch',
    })

    const response = await POST(createRequest('new@example.com'))
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload).toMatchObject({ error: 'Forbidden: Invalid request origin' })
    expect(recordAdminEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.invite.denied',
        outcome: 'deny',
      })
    )
  })

  it('returns 403 when user is not an active-workspace admin', async () => {
    getSupabaseServerClientMock.mockReturnValue(createServerClient(authenticatedUser))
    resolveActiveWorkspaceAdminContextMock.mockResolvedValue({
      snapshot: { user: { id: 'user-1' } },
      activeWorkspace: { id: 'workspace-1', role: 'member' },
      activeWorkspaceId: 'workspace-1',
      isWorkspaceAdmin: false,
    })

    const response = await POST(createRequest('new@example.com'))
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload).toMatchObject({
      error: 'Forbidden: Admin access required for the active workspace',
    })
    expect(getSupabaseServiceClientMock).not.toHaveBeenCalled()
    expect(recordAdminEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.invite.denied',
        outcome: 'deny',
      })
    )
  })

  it('returns 200 and records audit events when invite succeeds', async () => {
    const serverClient = createServerClient(authenticatedUser)
    getSupabaseServerClientMock.mockReturnValue(serverClient)
    resolveActiveWorkspaceAdminContextMock.mockResolvedValue({
      snapshot: { user: { id: 'user-1' } },
      activeWorkspace: { id: 'workspace-1', role: 'admin' },
      activeWorkspaceId: 'workspace-1',
      isWorkspaceAdmin: true,
    })

    const inviteUserByEmail = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'invited-user-1',
          email: 'new@example.com',
        },
      },
      error: null,
    })

    getSupabaseServiceClientMock.mockReturnValue({
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    })

    const response = await POST(createRequest('new@example.com'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      success: true,
      user: {
        id: 'invited-user-1',
        email: 'new@example.com',
      },
    })
    expect(inviteUserByEmail).toHaveBeenCalledWith('new@example.com', {
      redirectTo: 'http://localhost:3000/auth/callback',
    })
    expect(recordAdminEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.invite.requested',
        outcome: 'allow',
      })
    )
    expect(recordAdminEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.invite.sent',
        outcome: 'allow',
      })
    )
  })
})
