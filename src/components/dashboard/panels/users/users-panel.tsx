'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useUsersList,
  useUserGroups,
  usePermissionMatrix,
  useInviteUser,
  useUpdateUser,
} from '@/lib/hooks/use-users'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/schemas/users'
import { GroupsPanel } from './components/groups-panel'
import {
  InviteUserDialog,
  type InviteFormValues,
} from './components/invite-user-dialog'
import { PermissionsMatrix } from './components/permissions-matrix'
import { UsersTable } from './components/users-table'

interface UsersPanelProps {
  className?: string
}

export function UsersPanel({ className }: UsersPanelProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { data: usersState, isLoading: usersLoading } = useUsersList()
  const { data: groupsState, isLoading: groupsLoading } = useUserGroups()
  const { data: permissionsState, isLoading: permissionsLoading } = usePermissionMatrix()
  const inviteUser = useInviteUser()
  const updateUser = useUpdateUser()

  const users = usersState?.data ?? []
  const groups = groupsState?.data ?? []
  const permissions = permissionsState?.data ?? undefined

  const handleInvite = async (values: InviteFormValues) => {
    try {
      await inviteUser.mutateAsync(values)
      setInviteDialogOpen(false)
    } catch (error) {
      console.error('Failed to invite user:', error)
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateUser.mutateAsync({ userId, update: { isActive: !isActive } })
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateUser.mutateAsync({ userId, update: { role } })
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                Users ({users?.length || 0})
              </CardTitle>
              <InviteUserDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                onInvite={handleInvite}
                isPending={inviteUser.isPending}
              />
            </CardHeader>
            <CardContent className="p-0">
              <UsersTable
                users={users}
                isLoading={usersLoading}
                onRoleChange={handleRoleChange}
                onToggleActive={handleToggleActive}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupsPanel groups={groups} isLoading={groupsLoading} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsMatrix
            permissions={permissions}
            isLoading={permissionsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
