import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from '@/lib/schemas/users'
import {
  buildDemoDisplayName,
  cloneDemoValue,
  getDemoScenarioState,
  nextDemoTimestamp,
} from '@/mocks/scenario'

function usersState() {
  return getDemoScenarioState().users
}

export function getDemoUsers(): User[] {
  return cloneDemoValue(usersState())
}

export function getDemoUserDetail(userId: string): User | null {
  const user = usersState().find((entry) => entry.id === userId)
  return user ? cloneDemoValue(user) : null
}

export function getDemoUserGroups(): UserGroup[] {
  return cloneDemoValue(getDemoScenarioState().userGroups)
}

export function getDemoPermissionMatrix(): PermissionMatrix {
  return cloneDemoValue(getDemoScenarioState().permissionMatrix)
}

export function inviteDemoUser(request: InviteUserRequest): User {
  const user: User = {
    id: crypto.randomUUID(),
    name: buildDemoDisplayName(request.email),
    email: request.email,
    role: request.role,
    groups: request.groups ?? [],
    avatarUrl: undefined,
    createdAt: nextDemoTimestamp(0),
    lastLoginAt: undefined,
    isActive: true,
  }
  usersState().unshift(user)
  return cloneDemoValue(user)
}

export function updateDemoUser(
  userId: string,
  update: UpdateUserRequest
): User {
  const users = usersState()
  const index = users.findIndex((entry) => entry.id === userId)

  if (index === -1) {
    throw new Error('User not found')
  }

  const current = users[index]
  if (!current) {
    throw new Error('User not found')
  }

  const nextUser: User = {
    ...current,
    ...update,
    lastLoginAt: nextDemoTimestamp(0),
  }

  users[index] = nextUser
  return cloneDemoValue(nextUser)
}

export function deleteDemoUser(userId: string): void {
  const users = usersState()
  const index = users.findIndex((entry) => entry.id === userId)
  if (index >= 0) {
    users.splice(index, 1)
  }
}
