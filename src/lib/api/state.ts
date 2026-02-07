import { ApiError } from "@/lib/api/client"

export interface AppError {
  message: string
  status: number | null
  cause?: unknown
}

export interface ApiState<T> {
  data: T | null
  error: AppError | null
  source: "api" | "mock"
}

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

export function isMockDataEnabled() {
  return USE_MOCK_DATA
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
  getFromMock: () => Promise<T> | T
): Promise<ApiState<T>> {
  try {
    const data = await getFromApi()

    return {
      data,
      error: null,
      source: "api",
    }
  } catch (error) {
    if (!isMockDataEnabled()) {
      throw error
    }

    const mockData = await getFromMock()

    return {
      data: mockData,
      error: toAppError(error),
      source: "mock",
    }
  }
}
