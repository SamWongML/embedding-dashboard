import { http, HttpResponse } from 'msw'
import {
  getDemoErrorLogs,
  getDemoHealthCheck,
  getDemoLatencyResponse,
  getDemoRecentTraces,
  getDemoServiceUsage,
  getDemoTraceSpans,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'
import type { TraceFilters } from '@/lib/repositories/server-status'

function toTraceFilters(request: Request): TraceFilters {
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') ?? '50')
  const statusInput = url.searchParams.get('status') ?? 'all'
  const status: TraceFilters['status'] =
    statusInput === 'ok' || statusInput === 'error' ? statusInput : 'all'

  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50,
    status,
    service: url.searchParams.get('service') ?? 'all',
    query: url.searchParams.get('q') ?? '',
  }
}

export const serverStatusHandlers = [
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json(getDemoHealthCheck())
  }),
  http.get(`${API_URL}/metrics/latency`, () => {
    return HttpResponse.json(getDemoLatencyResponse())
  }),
  http.get(`${API_URL}/metrics/services`, () => {
    return HttpResponse.json(getDemoServiceUsage())
  }),
  http.get(`${API_URL}/logs/errors`, () => {
    return HttpResponse.json(getDemoErrorLogs())
  }),
  http.get(`${API_URL}/traces/recent`, ({ request }) => {
    return HttpResponse.json(getDemoRecentTraces(toTraceFilters(request)))
  }),
  http.get(`${API_URL}/traces/:traceId/spans`, ({ params }) => {
    const traceId = String(params.traceId ?? '')

    if (!traceId) {
      return HttpResponse.json({ message: 'Trace id is required' }, { status: 400 })
    }

    try {
      return HttpResponse.json(getDemoTraceSpans(traceId))
    } catch {
      return HttpResponse.json({ message: 'Trace not found' }, { status: 404 })
    }
  }),
]
