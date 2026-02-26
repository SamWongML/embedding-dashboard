export type ServiceMode = 'simple' | 'technical'

export const SERVICE_MODE_STORAGE_KEY = 'embedding-dashboard-service-mode'

export function isServiceMode(value: unknown): value is ServiceMode {
  return value === 'simple' || value === 'technical'
}
