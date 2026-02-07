import type {
  InviteUserRequest,
  PermissionMatrix,
  UpdateUserRequest,
  User,
  UserGroup,
} from "@/lib/schemas/users"

export function getMockUsers(): User[] {
  return [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin", groups: ["engineering"], avatarUrl: undefined, createdAt: "2024-01-15T10:00:00Z", lastLoginAt: new Date().toISOString(), isActive: true },
    { id: "2", name: "Bob Smith", email: "bob@example.com", role: "editor", groups: ["engineering", "product"], avatarUrl: undefined, createdAt: "2024-02-20T10:00:00Z", lastLoginAt: new Date().toISOString(), isActive: true },
    { id: "3", name: "Carol Williams", email: "carol@example.com", role: "viewer", groups: ["product"], avatarUrl: undefined, createdAt: "2024-03-10T10:00:00Z", lastLoginAt: new Date().toISOString(), isActive: true },
    { id: "4", name: "David Brown", email: "david@example.com", role: "editor", groups: ["engineering"], avatarUrl: undefined, createdAt: "2024-04-05T10:00:00Z", lastLoginAt: new Date().toISOString(), isActive: false },
  ]
}

export const mockGroups: UserGroup[] = [
  { id: "engineering", name: "Engineering", description: "Engineering team members", memberCount: 25, permissions: ["read", "write", "delete"], createdAt: "2024-01-01T10:00:00Z" },
  { id: "product", name: "Product", description: "Product team members", memberCount: 12, permissions: ["read", "write"], createdAt: "2024-01-01T10:00:00Z" },
  { id: "support", name: "Support", description: "Customer support team", memberCount: 8, permissions: ["read"], createdAt: "2024-01-01T10:00:00Z" },
]

export const mockPermissionMatrix: PermissionMatrix = {
  resources: ["embeddings", "search", "records", "graph", "users"],
  roles: [
    { role: "admin", permissions: { embeddings: ["read", "write", "delete", "admin"], search: ["read", "write", "delete", "admin"], records: ["read", "write", "delete", "admin"], graph: ["read", "write", "delete", "admin"], users: ["read", "write", "delete", "admin"] } },
    { role: "editor", permissions: { embeddings: ["read", "write"], search: ["read", "write"], records: ["read", "write"], graph: ["read", "write"], users: ["read"] } },
    { role: "viewer", permissions: { embeddings: ["read"], search: ["read"], records: ["read"], graph: ["read"], users: [] } },
  ],
}

export function getMockUserDetail(userId: string): User | null {
  return getMockUsers().find((user) => user.id === userId) || null
}

export function inviteMockUser(request: InviteUserRequest): User {
  return {
    id: crypto.randomUUID(),
    name: request.email.split("@")[0],
    email: request.email,
    role: request.role,
    groups: request.groups || [],
    createdAt: new Date().toISOString(),
    isActive: true,
  }
}

export function updateMockUser(
  userId: string,
  update: UpdateUserRequest
): User {
  const user = getMockUsers().find((item) => item.id === userId)
  if (!user) {
    throw new Error("User not found")
  }

  return { ...user, ...update }
}
