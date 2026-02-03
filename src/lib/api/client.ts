import * as z from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  const config: RequestInit = {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    )
  }

  const data = await response.json()

  if (schema) {
    const result = schema.safeParse(data)
    if (!result.success) {
      console.error('API response validation failed:', result.error)
      throw new ApiError('Invalid API response format', 500, result.error)
    }
    return result.data
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }, schema),

  post: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }, schema),

  put: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }, schema),

  patch: <T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }, schema),

  delete: <T>(endpoint: string, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }, schema),
}

export { API_BASE_URL }
