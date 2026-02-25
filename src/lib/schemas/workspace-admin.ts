import * as z from 'zod'

export const workspaceRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer'])

export const workspaceAdminKnowledgeBaseStatusSchema = z.enum([
  'ready',
  'indexing',
  'error',
])

export const workspaceAdminKnowledgeBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  documents: z.number().int().nonnegative(),
  vectors: z.number().int().nonnegative(),
  lastUpdated: z.string(),
  status: workspaceAdminKnowledgeBaseStatusSchema,
})

export const workspaceAdminUsageSchema = z.object({
  embeddings: z.number().int().nonnegative(),
  searches: z.number().int().nonnegative(),
  storageGb: z.number().nonnegative(),
  storageLimitGb: z.number().positive(),
})

export const workspaceAdminApiKeySchema = z.object({
  masked: z.string(),
  revealed: z.string(),
})

export const workspaceAdminWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  role: workspaceRoleSchema,
  plan: z.enum(['free', 'pro', 'enterprise']),
  status: z.enum(['active', 'archived']),
  createdAt: z.string(),
  members: z.number().int().nonnegative(),
  knowledgeBases: z.array(workspaceAdminKnowledgeBaseSchema),
  usage: workspaceAdminUsageSchema,
  apiKey: workspaceAdminApiKeySchema,
})

export const workspaceAdminAccessPermissionSchema = z.enum([
  'read',
  'write',
  'admin',
])

export const workspaceAdminAccessRuleSchema = z.object({
  id: z.string(),
  group: z.string(),
  workspaceId: z.string(),
  knowledgeBaseId: z.string(),
  knowledgeBase: z.string(),
  permission: workspaceAdminAccessPermissionSchema,
  createdBy: z.string(),
  createdAt: z.string(),
})

export const workspaceAdminOverviewSchema = z.object({
  activeWorkspaces: z.number().int().nonnegative(),
  totalWorkspaces: z.number().int().nonnegative(),
  totalKnowledgeBases: z.number().int().nonnegative(),
  totalAccessRules: z.number().int().nonnegative(),
  totalVectors: z.number().int().nonnegative(),
})

export const workspaceAdminViewModelSchema = z.object({
  workspaces: z.array(workspaceAdminWorkspaceSchema),
  accessRules: z.array(workspaceAdminAccessRuleSchema),
  groups: z.array(z.string()),
  overview: workspaceAdminOverviewSchema,
})

export type WorkspaceAdminKnowledgeBaseStatus = z.infer<
  typeof workspaceAdminKnowledgeBaseStatusSchema
>
export type WorkspaceAdminKnowledgeBase = z.infer<
  typeof workspaceAdminKnowledgeBaseSchema
>
export type WorkspaceAdminUsage = z.infer<typeof workspaceAdminUsageSchema>
export type WorkspaceAdminApiKey = z.infer<typeof workspaceAdminApiKeySchema>
export type WorkspaceAdminWorkspace = z.infer<typeof workspaceAdminWorkspaceSchema>
export type WorkspaceAdminAccessPermission = z.infer<
  typeof workspaceAdminAccessPermissionSchema
>
export type WorkspaceAdminAccessRule = z.infer<typeof workspaceAdminAccessRuleSchema>
export type WorkspaceAdminOverview = z.infer<typeof workspaceAdminOverviewSchema>
export type WorkspaceAdminViewModel = z.infer<typeof workspaceAdminViewModelSchema>
