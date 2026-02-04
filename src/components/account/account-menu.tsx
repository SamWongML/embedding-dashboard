'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Bell,
  BookOpen,
  ChevronsUpDown,
  CircleUser,
  HelpCircle,
  Keyboard,
  LogOut,
  Plus,
  Settings,
  Shield,
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
import { cn } from '@/lib/utils'

interface AccountMenuProps {
  collapsed: boolean
  className?: string
}

interface AccountMenuTriggerProps {
  collapsed: boolean
  name: string
  email: string
  workspace: string
  avatarUrl?: string
  className?: string
}

interface AccountMenuContentProps {
  activeWorkspaceId: string
  workspaces: ReturnType<typeof useAccount>['workspaces']
  onWorkspaceChange: (workspaceId: string) => void
  onSignOut: () => Promise<void>
  userName: string
  userEmail: string
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
  name,
  email,
  workspace,
  avatarUrl,
  className,
}: AccountMenuTriggerProps) {
  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          'w-full items-center justify-start gap-3 px-2 py-2 text-left hover:bg-sidebar-accent',
          collapsed && 'justify-center px-0',
          className
        )}
      >
        <Avatar className={cn('h-8 w-8', collapsed && 'h-9 w-9')}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {workspace}
            </span>
          </div>
        )}
        {!collapsed && (
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
        )}
        <span className="sr-only">Open account menu</span>
      </Button>
    </DropdownMenuTrigger>
  )

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
  planLabel,
  roleLabel,
  className,
}: AccountMenuContentProps) {
  return (
    <DropdownMenuContent
      align="start"
      side="top"
      sideOffset={12}
      className={cn('w-72', className)}
    >
      <div className="px-2 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{userName}</div>
            <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">{planLabel}</Badge>
          <Badge variant="outline">{roleLabel}</Badge>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        Workspaces
      </DropdownMenuLabel>
      {workspaces.map((workspace) => (
        <DropdownMenuItem
          key={workspace.id}
          onSelect={() => onWorkspaceChange(workspace.id)}
          className="flex items-center gap-2"
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full border',
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
      <DropdownMenuItem>
        <Plus className="h-4 w-4" />
        Create workspace
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/settings?tab=notifications">
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <HelpCircle className="h-4 w-4" />
        Support
      </DropdownMenuItem>
      <DropdownMenuItem>
        <BookOpen className="h-4 w-4" />
        Docs
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Keyboard className="h-4 w-4" />
        Keyboard shortcuts
        <DropdownMenuShortcut>?</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Shield className="h-4 w-4" />
        Privacy & security
      </DropdownMenuItem>
      <DropdownMenuItem>
        <CircleUser className="h-4 w-4" />
        View profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onSelect={() => void onSignOut()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

type AccountMenuComponent = React.FC<AccountMenuProps> & {
  Trigger: typeof AccountMenuTrigger
  Content: typeof AccountMenuContent
}

const AccountMenu = (({ collapsed, className }: AccountMenuProps) => {
  const {
    user,
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspace,
    signOut,
  } = useAccount()

  return (
    <DropdownMenu>
      <AccountMenuTrigger
        collapsed={collapsed}
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
