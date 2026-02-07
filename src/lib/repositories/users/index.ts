import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from '@/lib/schemas/users'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  deleteUser,
  fetchPermissionMatrix,
  fetchUserDetail,
  fetchUserGroups,
  fetchUsers,
  inviteUser,
  updateUser,
} from '@/lib/repositories/users/api'
import {
  deleteDemoUser,
  getDemoPermissionMatrix,
  getDemoUserDetail,
  getDemoUserGroups,
  getDemoUsers,
  inviteDemoUser,
  updateDemoUser,
} from '@/mocks'

export interface UsersRepository {
  listUsers: () => Promise<User[]>
  getUserDetail: (userId: string) => Promise<User | null>
  listGroups: () => Promise<UserGroup[]>
  getPermissionMatrix: () => Promise<PermissionMatrix>
  inviteUser: (request: InviteUserRequest) => Promise<User>
  updateUser: (userId: string, update: UpdateUserRequest) => Promise<User>
  deleteUser: (userId: string) => Promise<void>
}

const apiRepository: UsersRepository = {
  listUsers: () => fetchUsers(),
  getUserDetail: async (userId) => fetchUserDetail(userId),
  listGroups: () => fetchUserGroups(),
  getPermissionMatrix: () => fetchPermissionMatrix(),
  inviteUser: (request) => inviteUser(request),
  updateUser: (userId, update) => updateUser(userId, update),
  deleteUser: (userId) => deleteUser(userId),
}

const demoRepository: UsersRepository = {
  listUsers: async () => getDemoUsers(),
  getUserDetail: async (userId) => getDemoUserDetail(userId),
  listGroups: async () => getDemoUserGroups(),
  getPermissionMatrix: async () => getDemoPermissionMatrix(),
  inviteUser: async (request) => inviteDemoUser(request),
  updateUser: async (userId, update) => updateDemoUser(userId, update),
  deleteUser: async (userId) => deleteDemoUser(userId),
}

export function getUsersRepository(mode: DataMode = getDataMode()): UsersRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
