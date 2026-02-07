import {
  API_BASE_URL,
  ApiError,
} from '@/lib/api/client'

const DEV_SCENARIO_GUIDANCE =
  'Tip: add ?scenario=success|error|slow or set NEXT_PUBLIC_DEV_API_SCENARIO to simulate API behavior locally.'

function withDevGuidance(message: string) {
  if (process.env.NODE_ENV === 'production') {
    return message
  }
  return `${message}\n${DEV_SCENARIO_GUIDANCE}`
}

function toApiUnavailableMessage(fallback: string) {
  return withDevGuidance(
    `${fallback} API is unreachable at ${API_BASE_URL}.`
  )
}

export function toActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const statusMessage = Number.isFinite(error.status)
      ? ` (HTTP ${error.status})`
      : ''

    if (error.message) {
      return withDevGuidance(`${error.message}${statusMessage}.`)
    }

    return withDevGuidance(`${fallback}${statusMessage}.`)
  }

  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return toApiUnavailableMessage(fallback)
    }

    return withDevGuidance(error.message || fallback)
  }

  return withDevGuidance(fallback)
}

export function toNoOpActionMessage(actionLabel: string) {
  return `${actionLabel} is not wired to backend APIs yet.`
}

