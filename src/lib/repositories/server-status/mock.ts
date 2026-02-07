import { getDemoServiceUsage } from '@/mocks'

export {
  getDemoErrorLogs as getMockErrors,
  getDemoHealthCheck as getMockHealthCheck,
  getDemoLatencyResponse as getMockLatencyResponse,
} from '@/mocks'

export const mockServices = getDemoServiceUsage()
