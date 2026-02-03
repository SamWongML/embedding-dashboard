import * as z from 'zod'

export const userRoleSchema = z.enum(['admin', 'editor', 'viewer'])

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  groups: z.array(z.string()),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  lastLoginAt: z.string().optional(),
  isActive: z.boolean(),
})

export const userGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  memberCount: z.number(),
  permissions: z.array(z.string()),
  createdAt: z.string(),
})

export const permissionSchema = z.object({
  id: z.string(),
  resource: z.string(),
  action: z.enum(['read', 'write', 'delete', 'admin']),
  scope: z.string().optional(),
})

export const permissionMatrixSchema = z.object({
  resources: z.array(z.string()),
  roles: z.array(z.object({
    role: userRoleSchema,
    permissions: z.record(z.string(), z.array(z.string())),
  })),
})

export const inviteUserRequestSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
  groups: z.array(z.string()).optional(),
})

export const updateUserRequestSchema = z.object({
  name: z.string().optional(),
  role: userRoleSchema.optional(),
  groups: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type UserRole = z.infer<typeof userRoleSchema>
export type User = z.infer<typeof userSchema>
export type UserGroup = z.infer<typeof userGroupSchema>
export type Permission = z.infer<typeof permissionSchema>
export type PermissionMatrix = z.infer<typeof permissionMatrixSchema>
export type InviteUserRequest = z.infer<typeof inviteUserRequestSchema>
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
