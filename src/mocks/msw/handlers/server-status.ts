import { http, HttpResponse } from 'msw'
import {
  getDemoErrorLogs,
  getDemoHealthCheck,
  getDemoLatencyResponse,
  getDemoServiceUsage,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

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
]
