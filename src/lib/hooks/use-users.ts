'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from '@/lib/schemas/users'
import { getUsersRepository } from '@/lib/repositories/users'

const usersRepository = getUsersRepository()

export function useUsersList() {
  return useQuery<User[]>({
    queryKey: queryKeys.users.list(),
    queryFn: () => usersRepository.listUsers(),
  })
}

export function useUserDetail(userId: string | null) {
  return useQuery<User | null>({
    queryKey: queryKeys.users.detail(userId || ''),
    queryFn: () => usersRepository.getUserDetail(userId || ''),
    enabled: !!userId,
  })
}

export function useUserGroups() {
  return useQuery<UserGroup[]>({
    queryKey: queryKeys.users.groups(),
    queryFn: () => usersRepository.listGroups(),
  })
}

export function usePermissionMatrix() {
  return useQuery<PermissionMatrix>({
    queryKey: queryKeys.users.permissions(),
    queryFn: () => usersRepository.getPermissionMatrix(),
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: InviteUserRequest) => usersRepository.inviteUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, update }: { userId: string; update: UpdateUserRequest }) =>
      usersRepository.updateUser(userId, update),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => usersRepository.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}
