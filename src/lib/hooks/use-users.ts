'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiState } from '@/lib/api'
import { queryKeys, resolveApiState } from '@/lib/api'
import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from '@/lib/schemas/users'
import {
  deleteUser as deleteUserApi,
  fetchPermissionMatrix,
  fetchUserDetail,
  fetchUserGroups,
  fetchUsers,
  inviteUser,
  updateUser,
} from '@/lib/repositories/users/api'
import {
  getMockUserDetail,
  getMockUsers,
  inviteMockUser,
  mockGroups,
  mockPermissionMatrix,
  updateMockUser,
} from '@/lib/repositories/users/mock'

export function useUsersList() {
  return useQuery<ApiState<User[]>>({
    queryKey: queryKeys.users.list(),
    queryFn: () => resolveApiState(fetchUsers, getMockUsers),
  })
}

export function useUserDetail(userId: string | null) {
  return useQuery<ApiState<User | null>>({
    queryKey: queryKeys.users.detail(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return {
          data: null,
          error: null,
          source: 'api',
        }
      }

      const detailState = await resolveApiState(
        () => fetchUserDetail(userId),
        () => getMockUserDetail(userId)
      )

      return detailState
    },
    enabled: !!userId,
  })
}

export function useUserGroups() {
  return useQuery<ApiState<UserGroup[]>>({
    queryKey: queryKeys.users.groups(),
    queryFn: () => resolveApiState(fetchUserGroups, () => mockGroups),
  })
}

export function usePermissionMatrix() {
  return useQuery<ApiState<PermissionMatrix>>({
    queryKey: queryKeys.users.permissions(),
    queryFn: () => resolveApiState(fetchPermissionMatrix, () => mockPermissionMatrix),
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: InviteUserRequest) => resolveApiState(
      () => inviteUser(request),
      () => inviteMockUser(request)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, update }: { userId: string; update: UpdateUserRequest }) =>
      resolveApiState(
        () => updateUser(userId, update),
        () => updateMockUser(userId, update)
      ),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => resolveApiState(
      () => deleteUserApi(userId),
      () => undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}
