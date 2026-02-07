import { api } from "@/lib/api"
import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from "@/lib/schemas/users"
import {
  permissionMatrixSchema,
  userGroupSchema,
  userSchema,
} from "@/lib/schemas/users"

export async function fetchUsers(): Promise<User[]> {
  return api.get<User[]>("/users", userSchema.array())
}

export async function fetchUserDetail(userId: string): Promise<User> {
  return api.get<User>(`/users/${userId}`, userSchema)
}

export async function fetchUserGroups(): Promise<UserGroup[]> {
  return api.get<UserGroup[]>("/users/groups", userGroupSchema.array())
}

export async function fetchPermissionMatrix(): Promise<PermissionMatrix> {
  return api.get<PermissionMatrix>("/users/permissions", permissionMatrixSchema)
}

export async function inviteUser(request: InviteUserRequest): Promise<User> {
  return api.post<User>("/users/invite", request, userSchema)
}

export async function updateUser(
  userId: string,
  update: UpdateUserRequest
): Promise<User> {
  return api.patch<User>(`/users/${userId}`, update, userSchema)
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`)
}
