import { http, HttpResponse } from 'msw'
import type {
  InviteUserRequest,
  UpdateUserRequest,
} from '@/lib/schemas/users'
import {
  deleteDemoUser,
  getDemoPermissionMatrix,
  getDemoUserDetail,
  getDemoUserGroups,
  getDemoUsers,
  inviteDemoUser,
  updateDemoUser,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

export const usersHandlers = [
  http.get(`${API_URL}/users/groups`, () => {
    return HttpResponse.json(getDemoUserGroups())
  }),
  http.get(`${API_URL}/users/permissions`, () => {
    return HttpResponse.json(getDemoPermissionMatrix())
  }),
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json(getDemoUsers())
  }),
  http.get(`${API_URL}/users/:userId`, ({ params }) => {
    const userId = String(params.userId ?? '')
    const user = getDemoUserDetail(userId)
    if (!user) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(user)
  }),
  http.post(`${API_URL}/users/invite`, async ({ request }) => {
    const body = (await request.json()) as InviteUserRequest
    return HttpResponse.json(inviteDemoUser(body))
  }),
  http.patch(`${API_URL}/users/:userId`, async ({ request, params }) => {
    const body = (await request.json()) as UpdateUserRequest
    const userId = String(params.userId ?? '')
    try {
      return HttpResponse.json(updateDemoUser(userId, body))
    } catch (error) {
      return HttpResponse.json(
        { message: (error as Error).message },
        { status: 404 }
      )
    }
  }),
  http.delete(`${API_URL}/users/:userId`, ({ params }) => {
    const userId = String(params.userId ?? '')
    deleteDemoUser(userId)
    return HttpResponse.json({ ok: true })
  }),
]
