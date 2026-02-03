'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useUsersList,
  useUserGroups,
  usePermissionMatrix,
  useInviteUser,
  useUpdateUser,
} from '@/lib/hooks/use-users'
import { cn } from '@/lib/utils'
import type { User, UserRole } from '@/lib/schemas/users'

interface UsersPanelProps {
  className?: string
}

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

const roleColors: Record<UserRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  editor: 'bg-primary text-primary-foreground',
  viewer: 'bg-secondary text-secondary-foreground',
}

export function UsersPanel({ className }: UsersPanelProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { data: users, isLoading: usersLoading } = useUsersList()
  const { data: groups, isLoading: groupsLoading } = useUserGroups()
  const { data: permissions, isLoading: permissionsLoading } = usePermissionMatrix()
  const inviteUser = useInviteUser()
  const updateUser = useUpdateUser()

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  })

  const handleInvite = async (values: InviteFormValues) => {
    try {
      await inviteUser.mutateAsync(values)
      setInviteDialogOpen(false)
      inviteForm.reset()
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                Users ({users?.length || 0})
              </CardTitle>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                      Send an invitation to add a new user to the dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...inviteForm}>
                    <form
                      onSubmit={inviteForm.handleSubmit(handleInvite)}
                      className="space-y-4"
                    >
                      <FormField
                        control={inviteForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="user@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={inviteForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={inviteUser.isPending}
                        >
                          {inviteUser.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Invitation'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                              <div className="space-y-1">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-10 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(v) =>
                                handleRoleChange(user.id, v as UserRole)
                              }
                            >
                              <SelectTrigger className="w-24 h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {user.groups.slice(0, 2).map((group) => (
                                <Badge
                                  key={group}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {group}
                                </Badge>
                              ))}
                              {user.groups.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.groups.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.lastLoginAt
                              ? formatDate(user.lastLoginAt)
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() =>
                                handleToggleActive(user.id, user.isActive)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                User Groups
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {groups?.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {group.memberCount} members
                          </p>
                          <div className="flex gap-1 mt-1">
                            {group.permissions.slice(0, 3).map((perm) => (
                              <Badge
                                key={perm}
                                variant="secondary"
                                className="text-xs"
                              >
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="h-64 bg-muted rounded animate-pulse" />
              ) : permissions ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        {permissions.roles.map((r) => (
                          <TableHead key={r.role} className="capitalize">
                            {r.role}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.resources.map((resource) => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium capitalize">
                            {resource}
                          </TableCell>
                          {permissions.roles.map((r) => (
                            <TableCell key={`${resource}-${r.role}`}>
                              <div className="flex flex-wrap gap-1">
                                {r.permissions[resource]?.map((perm) => (
                                  <Badge
                                    key={perm}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
