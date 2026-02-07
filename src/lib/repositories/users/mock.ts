import {
  getDemoPermissionMatrix,
  getDemoUserGroups,
} from '@/mocks'
export {
  getDemoUserDetail as getMockUserDetail,
  getDemoUsers as getMockUsers,
  inviteDemoUser as inviteMockUser,
  updateDemoUser as updateMockUser,
} from '@/mocks'

export const mockGroups = getDemoUserGroups()
export const mockPermissionMatrix = getDemoPermissionMatrix()
