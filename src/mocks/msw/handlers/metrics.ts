import { http, HttpResponse } from 'msw'
import {
  getDemoEmbeddingTrends,
  getDemoMetricsOverview,
  getDemoSearchAnalytics,
  getDemoTopHits,
  getDemoTopUsers,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

function queryPeriod(requestUrl: URL, fallback = '24h') {
  return requestUrl.searchParams.get('period') ?? fallback
}

export const metricsHandlers = [
  http.get(`${API_URL}/metrics/overview`, ({ request }) => {
    const period = queryPeriod(new URL(request.url))
    return HttpResponse.json(getDemoMetricsOverview(period))
  }),
  http.get(`${API_URL}/metrics/top-hits`, () => {
    return HttpResponse.json(getDemoTopHits())
  }),
  http.get(`${API_URL}/metrics/top-users`, () => {
    return HttpResponse.json(getDemoTopUsers())
  }),
  http.get(`${API_URL}/metrics/trends`, ({ request }) => {
    const period = queryPeriod(new URL(request.url), '30d')
    return HttpResponse.json(getDemoEmbeddingTrends(period))
  }),
  http.get(`${API_URL}/metrics/search-analytics`, ({ request }) => {
    const period = queryPeriod(new URL(request.url), '7d')
    return HttpResponse.json(getDemoSearchAnalytics(period))
  }),
]
