'use client'

import * as React from 'react'
import {
  Building2,
  Copy,
  Database,
  Eye,
  EyeOff,
  FolderOpen,
  Layers,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { ActionWarningState } from '@/components/dashboard/panels/shared/action-warning-state'
import { QueryErrorState } from '@/components/dashboard/panels/shared/query-error-state'
import { OverviewMetricCard } from '@/components/dashboard/panels/workspace/overview-metric-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toNoOpActionMessage } from '@/lib/api'
import { useWorkspaceAdmin } from '@/lib/hooks/use-workspace-admin'
import type {
  WorkspaceAdminAccessPermission,
  WorkspaceAdminWorkspace,
} from '@/lib/schemas/workspace-admin'
import { cn } from '@/lib/utils'

const ACCESS_PERMISSION_COLOR: Record<WorkspaceAdminAccessPermission, string> = {
  admin: 'border-destructive/30 text-destructive',
  write: 'border-warning/30 text-warning',
  read: 'border-success/30 text-success',
}

const KNOWLEDGE_BASE_STATUS_COLOR = {
  ready: 'border-success/30 text-success',
  indexing: 'border-warning/30 text-warning',
  error: 'border-destructive/30 text-destructive',
} as const

const DEFAULT_WORKSPACE_FORM = {
  name: '',
  slug: '',
  description: '',
  storageLimitGb: '5',
}

const DEFAULT_ACCESS_RULE_FORM = {
  group: '',
  knowledgeBaseId: '',
  permission: 'read' as WorkspaceAdminAccessPermission,
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function WorkspacePanel() {
  const { data, isLoading, isError, errorMessage, refetch } = useWorkspaceAdmin()

  const [tab, setTab] = React.useState('workspaces')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [groupFilter, setGroupFilter] = React.useState('all')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null)
  const [revealedApiKeyWorkspaceId, setRevealedApiKeyWorkspaceId] = React.useState<string | null>(
    null
  )
  const [actionWarning, setActionWarning] = React.useState<string | null>(null)
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = React.useState(false)
  const [accessRuleDialogOpen, setAccessRuleDialogOpen] = React.useState(false)
  const [workspaceForm, setWorkspaceForm] = React.useState(DEFAULT_WORKSPACE_FORM)
  const [accessRuleForm, setAccessRuleForm] = React.useState(DEFAULT_ACCESS_RULE_FORM)

  React.useEffect(() => {
    if (!selectedWorkspaceId && data.workspaces.length > 0) {
      setSelectedWorkspaceId(data.workspaces[0]?.id ?? null)
    }
  }, [data.workspaces, selectedWorkspaceId])

  const filteredWorkspaces = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return data.workspaces
    }

    return data.workspaces.filter((workspace) => {
      return (
        workspace.name.toLowerCase().includes(query) ||
        workspace.slug.toLowerCase().includes(query) ||
        workspace.description.toLowerCase().includes(query)
      )
    })
  }, [data.workspaces, searchQuery])

  const selectedWorkspace = React.useMemo(() => {
    const selected = data.workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
    if (selected) {
      return selected
    }
    return filteredWorkspaces[0] ?? data.workspaces[0] ?? null
  }, [data.workspaces, filteredWorkspaces, selectedWorkspaceId])

  const filteredRules = React.useMemo(() => {
    if (groupFilter === 'all') {
      return data.accessRules
    }

    return data.accessRules.filter((rule) => rule.group === groupFilter)
  }, [data.accessRules, groupFilter])

  const knowledgeBaseOptions = React.useMemo(() => {
    return data.workspaces.flatMap((workspace) =>
      workspace.knowledgeBases.map((knowledgeBase) => ({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        knowledgeBaseId: knowledgeBase.id,
        knowledgeBaseName: knowledgeBase.name,
      }))
    )
  }, [data.workspaces])

  const resolvedAccessRuleGroup = accessRuleForm.group || data.groups[0] || ''
  const resolvedAccessRuleKnowledgeBase =
    accessRuleForm.knowledgeBaseId || knowledgeBaseOptions[0]?.knowledgeBaseId || ''

  const handleNoOpAction = React.useCallback((actionLabel: string) => {
    setActionWarning(toNoOpActionMessage(actionLabel))
  }, [])

  const handleCopyApiKey = React.useCallback(async (workspace: WorkspaceAdminWorkspace) => {
    if (!('clipboard' in navigator) || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(workspace.apiKey.revealed)
    } catch {
      // Intentionally no-op: clipboard failures should not disrupt admin workflows.
    }
  }, [])

  const handleSubmitWorkspace = React.useCallback(() => {
    handleNoOpAction('Create workspace')
    setWorkspaceDialogOpen(false)
    setWorkspaceForm(DEFAULT_WORKSPACE_FORM)
  }, [handleNoOpAction])

  const handleSubmitAccessRule = React.useCallback(() => {
    handleNoOpAction('Create access rule')
    setAccessRuleDialogOpen(false)
    setAccessRuleForm(DEFAULT_ACCESS_RULE_FORM)
  }, [handleNoOpAction])

  if (isError && data.workspaces.length === 0) {
    return (
      <QueryErrorState
        title="Workspace administration unavailable"
        description={errorMessage ?? 'Unable to load workspace administration data.'}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-(--metric-card-section-gap)">
      {actionWarning ? (
        <div aria-live="polite">
          <ActionWarningState
            title="Workspace action not available"
            variant="warning"
            description={actionWarning}
          />
        </div>
      ) : null}

      {isError && errorMessage ? (
        <div aria-live="polite">
          <ActionWarningState
            title="Workspace data partially unavailable"
            variant="warning"
            description={errorMessage}
            onRetry={() => {
              void refetch()
            }}
          />
        </div>
      ) : null}

      <div className="grid auto-rows-fr gap-(--metric-card-grid-gap) [grid-template-columns:repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))]">
        <OverviewMetricCard
          title="Active Workspaces"
          value={data.overview.activeWorkspaces}
          subtitle={`${data.overview.totalWorkspaces} total`}
          icon={Building2}
          animationMode="on-mount"
        />
        <OverviewMetricCard
          title="Knowledge Bases"
          value={data.overview.totalKnowledgeBases}
          subtitle="Across all workspaces"
          icon={Database}
          animationMode="on-mount"
        />
        <OverviewMetricCard
          title="Access Rules"
          value={data.overview.totalAccessRules}
          subtitle={`${data.groups.length} groups`}
          icon={Shield}
          animationMode="on-mount"
        />
        <OverviewMetricCard
          title="Total Vectors"
          value={Math.round(data.overview.totalVectors / 1000)}
          valueSuffix="K"
          subtitle="Indexed vectors"
          icon={Layers}
          animationMode="on-mount"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>

          {tab === 'workspaces' ? (
            <Button
              size="sm"
              onClick={() => setWorkspaceDialogOpen(true)}
              className="gap-(--dropdown-gap)"
            >
              <Plus className="size-(--icon-sm)" />
              New workspace
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setAccessRuleDialogOpen(true)}
              className="gap-(--dropdown-gap)"
            >
              <Plus className="size-(--icon-sm)" />
              New rule
            </Button>
          )}
        </div>

        <TabsContent value="workspaces" className="space-y-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-(--icon-sm) -translate-y-1/2 text-muted-foreground" />
            <Input
              name="workspace-search"
              autoComplete="off"
              placeholder="Search workspaces…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <Card className="max-h-[36rem] overflow-auto">
              <CardHeader className="pb-2">
                <CardTitle className="typography-size-base typography-weight-medium">
                  Workspace List
                </CardTitle>
                <CardDescription>
                  Select a workspace to review API access, usage, and knowledge base health.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-22 animate-pulse rounded-md border bg-muted/50" />
                  ))
                ) : filteredWorkspaces.length > 0 ? (
                  filteredWorkspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => setSelectedWorkspaceId(workspace.id)}
                      className={cn(
                        'w-full rounded-md border p-3 text-left transition-colors',
                        selectedWorkspace?.id === workspace.id
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="truncate typography-size-sm typography-weight-medium">
                          {workspace.name}
                        </div>
                        <Badge variant="outline" className="typography-size-xs capitalize">
                          {workspace.role}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 typography-size-xs text-muted-foreground">
                        {workspace.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 typography-size-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Database className="size-3.5" />
                          {workspace.knowledgeBases.length}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" />
                          {workspace.members}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Layers className="size-3.5" />
                          {Math.round(
                            workspace.knowledgeBases.reduce((sum, kb) => sum + kb.vectors, 0) / 1000
                          )}
                          K
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed p-4 typography-size-sm text-muted-foreground">
                    No workspaces match this search.
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedWorkspace ? (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{selectedWorkspace.name}</CardTitle>
                      <CardDescription>{selectedWorkspace.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${selectedWorkspace.name}`}
                        onClick={() => handleNoOpAction('Edit workspace')}
                      >
                        <Pencil className="size-(--icon-sm)" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${selectedWorkspace.name}`}
                        onClick={() => handleNoOpAction('Delete workspace')}
                      >
                        <Trash2 className="size-(--icon-sm)" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 typography-size-xs text-muted-foreground">
                    <span>/{selectedWorkspace.slug}</span>
                    <span>Created {new Date(selectedWorkspace.createdAt).toLocaleDateString()}</span>
                    <Badge variant="secondary">{selectedWorkspace.plan.toUpperCase()}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="typography-size-sm typography-weight-medium">API key</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={
                            revealedApiKeyWorkspaceId === selectedWorkspace.id
                              ? 'Hide API key'
                              : 'Reveal API key'
                          }
                          onClick={() =>
                            setRevealedApiKeyWorkspaceId((current) =>
                              current === selectedWorkspace.id ? null : selectedWorkspace.id
                            )
                          }
                        >
                          {revealedApiKeyWorkspaceId === selectedWorkspace.id ? (
                            <EyeOff className="size-(--icon-sm)" />
                          ) : (
                            <Eye className="size-(--icon-sm)" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Copy API key"
                          onClick={() => {
                            void handleCopyApiKey(selectedWorkspace)
                          }}
                        >
                          <Copy className="size-(--icon-sm)" />
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-md border bg-muted/30 px-3 py-2 typography-size-sm typography-family-mono text-muted-foreground">
                      {revealedApiKeyWorkspaceId === selectedWorkspace.id
                        ? selectedWorkspace.apiKey.revealed
                        : selectedWorkspace.apiKey.masked}
                    </div>
                  </section>

                  <section className="grid gap-3 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-5">
                        <p className="typography-size-xs text-muted-foreground">Embeddings</p>
                        <p className="typography-size-base typography-weight-semibold">
                          {selectedWorkspace.usage.embeddings.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="typography-size-xs text-muted-foreground">Searches</p>
                        <p className="typography-size-base typography-weight-semibold">
                          {selectedWorkspace.usage.searches.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="typography-size-xs text-muted-foreground">Storage</p>
                        <p className="typography-size-base typography-weight-semibold">
                          {selectedWorkspace.usage.storageGb} / {selectedWorkspace.usage.storageLimitGb} GB
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="typography-size-sm typography-weight-medium">Knowledge bases</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-(--dropdown-gap)"
                        onClick={() => handleNoOpAction('Add knowledge base')}
                      >
                        <Plus className="size-(--icon-sm)" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {selectedWorkspace.knowledgeBases.map((knowledgeBase) => (
                        <div
                          key={knowledgeBase.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate typography-size-sm typography-weight-medium">
                              {knowledgeBase.name}
                            </p>
                            <p className="typography-size-xs text-muted-foreground">
                              {knowledgeBase.documents} docs ·{' '}
                              {Math.round(knowledgeBase.vectors / 1000)}K vectors
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="typography-size-xs text-muted-foreground">
                              {knowledgeBase.lastUpdated}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'typography-size-xs',
                                KNOWLEDGE_BASE_STATUS_COLOR[knowledgeBase.status]
                              )}
                            >
                              {toTitleCase(knowledgeBase.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3">
                  <FolderOpen className="size-8 text-muted-foreground" />
                  <p className="typography-size-sm text-muted-foreground">
                    Select a workspace to view details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {data.groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="typography-size-base typography-weight-medium">
                Access Rules
              </CardTitle>
              <CardDescription>
                Role-based access assignments for workspace knowledge bases.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Knowledge Base</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length > 0 ? (
                    filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="typography-size-sm typography-weight-medium">
                          {rule.group}
                        </TableCell>
                        <TableCell className="typography-size-sm">
                          {rule.knowledgeBase}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'typography-size-xs capitalize',
                              ACCESS_PERMISSION_COLOR[rule.permission]
                            )}
                          >
                            {rule.permission}
                          </Badge>
                        </TableCell>
                        <TableCell className="typography-size-sm text-muted-foreground">
                          {rule.createdBy}
                        </TableCell>
                        <TableCell className="typography-size-sm text-muted-foreground">
                          {rule.createdAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit access rule for ${rule.group}`}
                              onClick={() => handleNoOpAction('Edit access rule')}
                            >
                              <Pencil className="size-(--icon-sm)" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete access rule for ${rule.group}`}
                              onClick={() => handleNoOpAction('Delete access rule')}
                            >
                              <Trash2 className="size-(--icon-sm)" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No access rules available for this group.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={workspaceDialogOpen} onOpenChange={setWorkspaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Provision a new workspace with isolated data, usage, and access controls.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name</Label>
              <Input
                id="workspace-name"
                name="workspace-name"
                autoComplete="off"
                value={workspaceForm.name}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Slug</Label>
              <Input
                id="workspace-slug"
                name="workspace-slug"
                autoComplete="off"
                value={workspaceForm.slug}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="e.g. engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Input
                id="workspace-description"
                name="workspace-description"
                autoComplete="off"
                value={workspaceForm.description}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="What does this workspace support?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-storage-limit">Storage limit</Label>
              <Select
                value={workspaceForm.storageLimitGb}
                onValueChange={(value) =>
                  setWorkspaceForm((current) => ({ ...current, storageLimitGb: value }))
                }
              >
                <SelectTrigger id="workspace-storage-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 GB</SelectItem>
                  <SelectItem value="5">5 GB</SelectItem>
                  <SelectItem value="10">10 GB</SelectItem>
                  <SelectItem value="25">25 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWorkspaceDialogOpen(false)
                setWorkspaceForm(DEFAULT_WORKSPACE_FORM)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitWorkspace}
              disabled={!workspaceForm.name.trim() || !workspaceForm.slug.trim()}
            >
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accessRuleDialogOpen} onOpenChange={setAccessRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create access rule</DialogTitle>
            <DialogDescription>
              Assign a group-level permission to a workspace knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-group">Group</Label>
              <Select
                value={resolvedAccessRuleGroup}
                onValueChange={(value) =>
                  setAccessRuleForm((current) => ({ ...current, group: value }))
                }
              >
                <SelectTrigger id="rule-group">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {data.groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-knowledge-base">Knowledge base</Label>
              <Select
                value={resolvedAccessRuleKnowledgeBase}
                onValueChange={(value) =>
                  setAccessRuleForm((current) => ({ ...current, knowledgeBaseId: value }))
                }
              >
                <SelectTrigger id="rule-knowledge-base">
                  <SelectValue placeholder="Select knowledge base" />
                </SelectTrigger>
                <SelectContent>
                  {knowledgeBaseOptions.map((option) => (
                    <SelectItem key={option.knowledgeBaseId} value={option.knowledgeBaseId}>
                      {option.workspaceName} · {option.knowledgeBaseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-permission">Permission</Label>
              <Select
                value={accessRuleForm.permission}
                onValueChange={(value) =>
                  setAccessRuleForm((current) => ({
                    ...current,
                    permission: value as WorkspaceAdminAccessPermission,
                  }))
                }
              >
                <SelectTrigger id="rule-permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAccessRuleDialogOpen(false)
                setAccessRuleForm(DEFAULT_ACCESS_RULE_FORM)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAccessRule}>Create rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
