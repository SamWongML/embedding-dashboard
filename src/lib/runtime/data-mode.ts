export type DataMode = 'api' | 'demo'

const DEFAULT_DATA_MODE: DataMode = 'api'

export function getDataMode(): DataMode {
  const value =
    process.env.NEXT_PUBLIC_DATA_MODE ??
    process.env.DATA_MODE ??
    DEFAULT_DATA_MODE

  return value === 'demo' ? 'demo' : 'api'
}

export function isDemoDataMode() {
  return getDataMode() === 'demo'
}

export function isApiDataMode() {
  return getDataMode() === 'api'
}
