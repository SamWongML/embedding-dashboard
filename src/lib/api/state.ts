import { ApiError } from "@/lib/api/client"
import { getDataMode } from '@/lib/runtime/data-mode'

export interface AppError {
  message: string
  status: number | null
  cause?: unknown
}

export interface ApiState<T> {
  data: T | null
  error: AppError | null
  source: 'api' | 'demo'
}

export function isDemoDataEnabled() {
  return getDataMode() === 'demo'
}

export function isMockDataEnabled() {
  return isDemoDataEnabled()
}

export function toAppError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      cause: error.data,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: null,
      cause: error,
    }
  }

  return {
    message: "Unknown error",
    status: null,
    cause: error,
  }
}

export async function resolveApiState<T>(
  getFromApi: () => Promise<T>,
  getFromDemo: () => Promise<T> | T
): Promise<ApiState<T>> {
  try {
    const data = await getFromApi()

    return {
      data,
      error: null,
      source: "api",
    }
  } catch (error) {
    if (!isDemoDataEnabled()) {
      throw error
    }

    const demoData = await getFromDemo()

    return {
      data: demoData,
      error: toAppError(error),
      source: 'demo',
    }
  }
}
