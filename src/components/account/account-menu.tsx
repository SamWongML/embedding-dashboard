'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Bell,
  BookOpen,
  ChevronsUpDown,
  HelpCircle,
  Keyboard,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAccount } from '@/lib/hooks/use-account'
import { DOCS_URL, SHORTCUTS_URL, SUPPORT_URL } from '@/lib/config/links'
import type { SidebarViewportMode } from '@/lib/layout/sidebar-mode'
import { cn } from '@/lib/utils'

interface AccountMenuProps {
  collapsed: boolean
  viewportMode: SidebarViewportMode
  className?: string
}

interface AccountMenuTriggerProps {
  collapsed: boolean
  compact: boolean
  name: string
  email: string
  workspace: string
  avatarUrl?: string
  className?: string
  interactive?: boolean
}

interface AccountMenuContentProps {
  activeWorkspaceId: string
  workspaces: ReturnType<typeof useAccount>['workspaces']
  onWorkspaceChange: (workspaceId: string) => void
  onSignOut: () => Promise<void>
  userName: string
  userEmail: string
  userAvatarUrl?: string
  workspaceName: string
  planLabel: string
  roleLabel: string
  className?: string
}

function getInitials(name: string) {
  const [first, second] = name.split(' ')
  const initial = `${first?.[0] ?? ''}${second?.[0] ?? ''}`
  return initial.toUpperCase() || 'U'
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function AccountMenuTrigger({
  collapsed,
  compact,
  name,
  email,
  workspace,
  avatarUrl,
  className,
  interactive = true,
}: AccountMenuTriggerProps) {
  const button = (
    <Button
      variant="ghost"
      className={cn(
        'w-full items-center justify-start gap-(--sidebar-item-gap) rounded-lg border border-transparent px-2.5 py-(--space-sm) text-left transition-colors hover:border-sidebar-border/70 hover:bg-sidebar-accent/60',
        collapsed && 'justify-center px-0',
        compact && 'mx-auto size-(--button-height-sm) justify-center rounded-md p-0',
        className
      )}
    >
      <Avatar
        className={cn(
          'size-(--avatar-size-sm) border border-sidebar-border/70',
          collapsed && 'size-(--avatar-size-md)',
          compact && 'size-(--avatar-size-xs)'
        )}
      >
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-sidebar-foreground">
            {name}
          </span>
          <span className="truncate text-xs leading-tight text-muted-foreground">
            {workspace}
          </span>
        </div>
      )}
      {!collapsed && (
        <ChevronsUpDown className="ml-auto size-(--icon-sm) text-muted-foreground/70" />
      )}
      <span className="sr-only">Open account menu</span>
    </Button>
  )

  if (!interactive) {
    return button
  }

  const trigger = <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>

  if (!collapsed) {
    return trigger
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {name} ({email})
      </TooltipContent>
    </Tooltip>
  )
}

function AccountMenuContent({
  activeWorkspaceId,
  workspaces,
  onWorkspaceChange,
  onSignOut,
  userName,
  userEmail,
  userAvatarUrl,
  workspaceName,
  planLabel,
  roleLabel,
  className,
}: AccountMenuContentProps) {
  const workspaceOptions = workspaces.slice(0, 3)

  return (
    <DropdownMenuContent
      align="start"
      side="top"
      sideOffset={12}
      className={cn('w-72', className)}
    >
      <div className="px-(--space-sm) py-(--space-sm)">
        <div className="flex items-center gap-(--sidebar-item-gap)">
          <Avatar className="size-(--avatar-size-md)">
            {userAvatarUrl ? (
              <AvatarImage src={userAvatarUrl} alt={userName} />
            ) : null}
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{userName}</div>
            <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
            <div className="truncate text-xs text-muted-foreground">{workspaceName}</div>
          </div>
        </div>
        <div className="mt-(--space-md) flex flex-wrap items-center gap-(--form-item-gap) text-xs">
          <Badge variant="secondary">{planLabel}</Badge>
          <Badge variant="outline">{roleLabel}</Badge>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        Workspaces
      </DropdownMenuLabel>
      {workspaceOptions.map((workspace) => (
        <DropdownMenuItem
          key={workspace.id}
          onSelect={() => onWorkspaceChange(workspace.id)}
          className="flex items-center gap-(--form-item-gap)"
        >
          <span
            className={cn(
              'size-2.5 rounded-full border',
              workspace.id === activeWorkspaceId
                ? 'border-primary bg-primary'
                : 'border-border bg-transparent'
            )}
          />
          <span className="flex-1 truncate">{workspace.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatRole(workspace.role)}
          </span>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem asChild>
        <Link href="/settings?tab=workspace">
          <Plus className="size-(--icon-sm)" />
          Create workspace
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings">
          <Settings className="size-(--icon-sm)" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/settings?tab=notifications">
          <Bell className="size-(--icon-sm)" />
          Notifications
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {SUPPORT_URL ? (
        <DropdownMenuItem asChild>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
            <HelpCircle className="size-(--icon-sm)" />
            Support
          </a>
        </DropdownMenuItem>
      ) : null}
      {DOCS_URL ? (
        <DropdownMenuItem asChild>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            <BookOpen className="size-(--icon-sm)" />
            Docs
          </a>
        </DropdownMenuItem>
      ) : null}
      {SHORTCUTS_URL ? (
        <DropdownMenuItem asChild>
          <a href={SHORTCUTS_URL} target="_blank" rel="noreferrer">
            <Keyboard className="size-(--icon-sm)" />
            Keyboard shortcuts
            <DropdownMenuShortcut>?</DropdownMenuShortcut>
          </a>
        </DropdownMenuItem>
      ) : null}
      {(SUPPORT_URL || DOCS_URL || SHORTCUTS_URL) ? <DropdownMenuSeparator /> : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onSelect={() => void onSignOut()}>
        <LogOut className="size-(--icon-sm)" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

type AccountMenuComponent = React.FC<AccountMenuProps> & {
  Trigger: typeof AccountMenuTrigger
  Content: typeof AccountMenuContent
}

const AccountMenu = (({ collapsed, viewportMode, className }: AccountMenuProps) => {
  const {
    user,
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspace,
    signOut,
  } = useAccount()
  const [hasMounted, setHasMounted] = React.useState(false)
  const compactTrigger = collapsed && viewportMode === 'medium'

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <AccountMenuTrigger
        collapsed={collapsed}
        compact={compactTrigger}
        name={user.name}
        email={user.email}
        workspace={activeWorkspace.name}
        avatarUrl={user.avatarUrl}
        className={className}
        interactive={false}
      />
    )
  }

  return (
    <DropdownMenu>
      <AccountMenuTrigger
        collapsed={collapsed}
        compact={compactTrigger}
        name={user.name}
        email={user.email}
        workspace={activeWorkspace.name}
        avatarUrl={user.avatarUrl}
        className={className}
      />
      <AccountMenuContent
        activeWorkspaceId={activeWorkspaceId}
        workspaces={workspaces}
        onWorkspaceChange={setActiveWorkspace}
        onSignOut={signOut}
        userName={user.name}
        userEmail={user.email}
        userAvatarUrl={user.avatarUrl}
        workspaceName={activeWorkspace.name}
        planLabel={activeWorkspace.plan.toUpperCase()}
        roleLabel={`${formatRole(activeWorkspace.role)} role`}
      />
    </DropdownMenu>
  )
}) as AccountMenuComponent

AccountMenu.Trigger = AccountMenuTrigger
AccountMenu.Content = AccountMenuContent

export { AccountMenu }
export default AccountMenu
