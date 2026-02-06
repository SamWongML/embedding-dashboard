'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAccount } from '@/lib/hooks/use-account'

function getInitials(name: string) {
  const [first, second] = name.split(' ')
  const initial = `${first?.[0] ?? ''}${second?.[0] ?? ''}`
  return initial.toUpperCase() || 'U'
}

export default function AccountTab() {
  const { user, activeWorkspace } = useAccount()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal details and default workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Avatar className="h-16 w-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <Badge variant="secondary" className="mt-2">
                {activeWorkspace.name}
              </Badge>
            </div>
            <Button variant="outline" className="md:ml-auto">
              Upload new photo
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button>Save changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default workspace</CardTitle>
          <CardDescription>
            Choose the workspace that opens first when you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue={activeWorkspace.id}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={activeWorkspace.id}>
                {activeWorkspace.name}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
