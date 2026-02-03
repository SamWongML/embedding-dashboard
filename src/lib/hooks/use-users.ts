'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type User,
  type UserGroup,
  type PermissionMatrix,
  type InviteUserRequest,
  type UpdateUserRequest,
} from '@/lib/schemas/users'

// Mock data for development
const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', groups: ['engineering'], avatarUrl: undefined, createdAt: '2024-01-15T10:00:00Z', lastLoginAt: new Date().toISOString(), isActive: true },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'editor', groups: ['engineering', 'product'], avatarUrl: undefined, createdAt: '2024-02-20T10:00:00Z', lastLoginAt: new Date().toISOString(), isActive: true },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'viewer', groups: ['product'], avatarUrl: undefined, createdAt: '2024-03-10T10:00:00Z', lastLoginAt: new Date().toISOString(), isActive: true },
  { id: '4', name: 'David Brown', email: 'david@example.com', role: 'editor', groups: ['engineering'], avatarUrl: undefined, createdAt: '2024-04-05T10:00:00Z', lastLoginAt: new Date().toISOString(), isActive: false },
]

const mockGroups: UserGroup[] = [
  { id: 'engineering', name: 'Engineering', description: 'Engineering team members', memberCount: 25, permissions: ['read', 'write', 'delete'], createdAt: '2024-01-01T10:00:00Z' },
  { id: 'product', name: 'Product', description: 'Product team members', memberCount: 12, permissions: ['read', 'write'], createdAt: '2024-01-01T10:00:00Z' },
  { id: 'support', name: 'Support', description: 'Customer support team', memberCount: 8, permissions: ['read'], createdAt: '2024-01-01T10:00:00Z' },
]

const mockPermissionMatrix: PermissionMatrix = {
  resources: ['embeddings', 'search', 'records', 'graph', 'users'],
  roles: [
    { role: 'admin', permissions: { embeddings: ['read', 'write', 'delete', 'admin'], search: ['read', 'write', 'delete', 'admin'], records: ['read', 'write', 'delete', 'admin'], graph: ['read', 'write', 'delete', 'admin'], users: ['read', 'write', 'delete', 'admin'] } },
    { role: 'editor', permissions: { embeddings: ['read', 'write'], search: ['read', 'write'], records: ['read', 'write'], graph: ['read', 'write'], users: ['read'] } },
    { role: 'viewer', permissions: { embeddings: ['read'], search: ['read'], records: ['read'], graph: ['read'], users: [] } },
  ],
}

export function useUsersList() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      try {
        return await api.get<User[]>('/users')
      } catch {
        return mockUsers
      }
    },
  })
}

export function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId || ''),
    queryFn: async () => {
      if (!userId) return null
      try {
        return await api.get<User>(`/users/${userId}`)
      } catch {
        return mockUsers.find(u => u.id === userId) || null
      }
    },
    enabled: !!userId,
  })
}

export function useUserGroups() {
  return useQuery({
    queryKey: queryKeys.users.groups(),
    queryFn: async () => {
      try {
        return await api.get<UserGroup[]>('/users/groups')
      } catch {
        return mockGroups
      }
    },
  })
}

export function usePermissionMatrix() {
  return useQuery({
    queryKey: queryKeys.users.permissions(),
    queryFn: async () => {
      try {
        return await api.get<PermissionMatrix>('/users/permissions')
      } catch {
        return mockPermissionMatrix
      }
    },
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: InviteUserRequest) => {
      try {
        return await api.post<User>('/users/invite', request)
      } catch {
        return {
          id: crypto.randomUUID(),
          name: request.email.split('@')[0],
          email: request.email,
          role: request.role,
          groups: request.groups || [],
          createdAt: new Date().toISOString(),
          isActive: true,
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, update }: { userId: string; update: UpdateUserRequest }) => {
      try {
        return await api.patch<User>(`/users/${userId}`, update)
      } catch {
        const user = mockUsers.find(u => u.id === userId)
        if (user) {
          return { ...user, ...update }
        }
        throw new Error('User not found')
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        await api.delete(`/users/${userId}`)
      } catch {
        // Mock success
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
    },
  })
}
