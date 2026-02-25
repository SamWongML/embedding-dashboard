'use client'

import * as React from 'react'
import type {
  WorkspaceAdminAccessPermission,
  WorkspaceAdminAccessRule,
  WorkspaceAdminKnowledgeBase,
  WorkspaceAdminViewModel,
  WorkspaceAdminWorkspace,
} from '@/lib/schemas/workspace-admin'
import { workspaceAdminViewModelSchema } from '@/lib/schemas/workspace-admin'
import { useAccount } from '@/lib/hooks/use-account'
import { useUserGroups, useUsersList } from '@/lib/hooks/use-users'

const DESCRIPTION_SUFFIXES = [
  'Team knowledge and operational workflows.',
  'Search quality, retrieval, and model operations.',
  'Cross-functional playbooks and onboarding docs.',
  'Documentation, runbooks, and release checklists.',
] as const

const KNOWLEDGE_BASE_NAMES = [
  'API Documentation',
  'Architecture Decisions',
  'Incident Reports',
  'Experiment Logs',
  'Product Specs',
  'Support Playbooks',
  'Operational Notes',
] as const

const LAST_UPDATED_OPTIONS = ['20m ago', '2h ago', '8h ago', '1d ago', '3d ago'] as const

const ACCESS_PERMISSION_ORDER: readonly WorkspaceAdminAccessPermission[] = [
  'admin',
  'write',
  'read',
]

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function toDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildWorkspaceApiKey(workspaceId: string) {
  const hash = hashString(workspaceId).toString(16).padStart(8, '0')
  const revealed = `wk_${hash.slice(0, 4)}${hash.slice(4, 8)}_${hash.slice(0, 4)}`
  const masked = `${revealed.slice(0, 6)}...${revealed.slice(-4)}`

  return { masked, revealed }
}

function buildKnowledgeBases(workspaceId: string, workspaceIndex: number) {
  const seed = hashString(workspaceId)
  const knowledgeBaseCount = 2 + (seed % 3)

  return Array.from({ length: knowledgeBaseCount }).map((_, index) => {
    const nameIndex = (workspaceIndex * 2 + index) % KNOWLEDGE_BASE_NAMES.length
    const base = (seed % 1000) + (index + 1) * 97
    const statusPick = (seed + index) % 9
    const status =
      statusPick === 0 ? 'error' : statusPick <= 2 ? 'indexing' : 'ready'

    return {
      id: `${workspaceId}-kb-${index + 1}`,
      name: KNOWLEDGE_BASE_NAMES[nameIndex] ?? 'Knowledge Base',
      documents: 24 + (base % 280),
      vectors: 2000 + base * 26,
      lastUpdated: LAST_UPDATED_OPTIONS[(seed + index) % LAST_UPDATED_OPTIONS.length] ?? '1d ago',
      status,
    } satisfies WorkspaceAdminKnowledgeBase
  })
}

function buildWorkspaceUsage(workspaceId: string, knowledgeBases: WorkspaceAdminKnowledgeBase[]) {
  const seed = hashString(workspaceId)
  const vectors = knowledgeBases.reduce((sum, kb) => sum + kb.vectors, 0)
  const storageLimitGb = 3 + (seed % 4) * 2
  const storageGb = Number((Math.min(storageLimitGb * 0.9, vectors / 60000)).toFixed(2))

  return {
    embeddings: 8000 + (seed % 12000),
    searches: 3000 + (seed % 9000),
    storageGb,
    storageLimitGb,
  }
}

function buildAccessRules(
  workspaces: WorkspaceAdminWorkspace[],
  groups: string[],
  actorName: string
): WorkspaceAdminAccessRule[] {
  const nonArchivedWorkspaces = workspaces.filter((workspace) => workspace.status === 'active')
  if (nonArchivedWorkspaces.length === 0 || groups.length === 0) {
    return []
  }

  return groups.flatMap((group, groupIndex) => {
    const workspace = nonArchivedWorkspaces[groupIndex % nonArchivedWorkspaces.length]
    const knowledgeBases = workspace?.knowledgeBases ?? []
    if (!workspace || knowledgeBases.length === 0) {
      return []
    }

    const kb = knowledgeBases[groupIndex % knowledgeBases.length]
    const permission =
      ACCESS_PERMISSION_ORDER[groupIndex % ACCESS_PERMISSION_ORDER.length] ?? 'read'

    return {
      id: `rule-${workspace.id}-${groupIndex + 1}`,
      group,
      workspaceId: workspace.id,
      knowledgeBaseId: kb.id,
      knowledgeBase: kb.name,
      permission,
      createdBy: actorName,
      createdAt: toDateLabel(workspace.createdAt),
    } satisfies WorkspaceAdminAccessRule
  })
}

export interface WorkspaceAdminHookResult {
  data: WorkspaceAdminViewModel
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function useWorkspaceAdmin(): WorkspaceAdminHookResult {
  const { user, workspaces, activeWorkspaceId } = useAccount()
  const usersQuery = useUsersList()
  const groupsQuery = useUserGroups()

  const workspaceSummaries = React.useMemo(() => {
    return [...workspaces].sort((left, right) => {
      if (left.id === activeWorkspaceId) return -1
      if (right.id === activeWorkspaceId) return 1
      return left.name.localeCompare(right.name)
    })
  }, [activeWorkspaceId, workspaces])

  const resolvedGroups = React.useMemo(() => {
    if (groupsQuery.data && groupsQuery.data.length > 0) {
      return groupsQuery.data.map((group) => group.name)
    }

    const userGroups = (usersQuery.data ?? []).flatMap((userEntry) => userEntry.groups)
    const dedupedGroups = Array.from(new Set(userGroups))
    if (dedupedGroups.length > 0) {
      return dedupedGroups
    }

    return ['Engineering', 'Product', 'Support']
  }, [groupsQuery.data, usersQuery.data])

  const data = React.useMemo(() => {
    const usersCount = usersQuery.data?.length ?? Math.max(6, workspaceSummaries.length * 3)

    const derivedWorkspaces = workspaceSummaries.map((workspace, workspaceIndex) => {
      const knowledgeBases = buildKnowledgeBases(workspace.id, workspaceIndex)
      const description =
        `${workspace.name}. ${DESCRIPTION_SUFFIXES[workspaceIndex % DESCRIPTION_SUFFIXES.length]}`
      const members = Math.max(
        1,
        Math.round(usersCount * (0.3 + ((hashString(workspace.id) % 40) / 100)))
      )

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description,
        role: workspace.role,
        plan: workspace.plan,
        status: 'active',
        createdAt: workspace.createdAt,
        members,
        knowledgeBases,
        usage: buildWorkspaceUsage(workspace.id, knowledgeBases),
        apiKey: buildWorkspaceApiKey(workspace.id),
      } satisfies WorkspaceAdminWorkspace
    })

    const accessRules = buildAccessRules(derivedWorkspaces, resolvedGroups, user.name)
    const totalVectors = derivedWorkspaces.reduce(
      (sum, workspace) =>
        sum +
        workspace.knowledgeBases.reduce(
          (workspaceSum, knowledgeBase) => workspaceSum + knowledgeBase.vectors,
          0
        ),
      0
    )

    const model = {
      workspaces: derivedWorkspaces,
      accessRules,
      groups: resolvedGroups,
      overview: {
        activeWorkspaces: derivedWorkspaces.filter((workspace) => workspace.status === 'active')
          .length,
        totalWorkspaces: derivedWorkspaces.length,
        totalKnowledgeBases: derivedWorkspaces.reduce(
          (sum, workspace) => sum + workspace.knowledgeBases.length,
          0
        ),
        totalAccessRules: accessRules.length,
        totalVectors,
      },
    }

    return workspaceAdminViewModelSchema.parse(model)
  }, [resolvedGroups, user.name, usersQuery.data?.length, workspaceSummaries])

  const errorMessage = React.useMemo(() => {
    const error = usersQuery.error || groupsQuery.error
    if (!error) {
      return null
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'Unable to load workspace administration data.'
  }, [groupsQuery.error, usersQuery.error])

  const isError =
    (usersQuery.isError && !usersQuery.data) ||
    (groupsQuery.isError && !groupsQuery.data)

  const refetch = React.useCallback(async () => {
    await Promise.all([usersQuery.refetch(), groupsQuery.refetch()])
  }, [groupsQuery, usersQuery])

  return {
    data,
    isLoading: usersQuery.isLoading || groupsQuery.isLoading,
    isError,
    errorMessage,
    refetch,
  }
}
