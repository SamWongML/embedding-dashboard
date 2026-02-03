import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8000'

export const handlers = [
  // Health check
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      uptime: 864000,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  }),

  // Latency metrics
  http.get(`${API_URL}/metrics/latency`, () => {
    return HttpResponse.json({
      current: 45,
      average: 52,
      p95: 89,
      p99: 120,
      history: Array.from({ length: 60 }, (_, i) => ({
        timestamp: new Date(Date.now() - (60 - i) * 1000).toISOString(),
        value: Math.floor(Math.random() * 50) + 30,
      })),
    })
  }),

  // Services
  http.get(`${API_URL}/metrics/services`, () => {
    return HttpResponse.json([
      { endpoint: '/api/embed/text', method: 'POST', count: 15420, avgLatency: 45 },
      { endpoint: '/api/embed/image', method: 'POST', count: 8320, avgLatency: 120 },
      { endpoint: '/api/search', method: 'POST', count: 25600, avgLatency: 32 },
    ])
  }),

  // Errors
  http.get(`${API_URL}/logs/errors`, () => {
    return HttpResponse.json([
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Test error message',
        source: 'test-service',
      },
    ])
  }),

  // Text embedding
  http.post(`${API_URL}/embed/text`, async ({ request }) => {
    const body = await request.json() as { text: string }
    return HttpResponse.json({
      results: [{
        id: 'test-id',
        text: body.text,
        vector: Array.from({ length: 1536 }, () => Math.random()),
        model: 'text-embedding-3-small',
        tokenCount: 100,
        createdAt: new Date().toISOString(),
      }],
      totalTokens: 100,
      processingTime: 50,
    })
  }),

  // Search
  http.post(`${API_URL}/search`, async ({ request }) => {
    const body = await request.json() as { query: string }
    return HttpResponse.json({
      results: [
        {
          id: '1',
          content: `Result for: ${body.query}`,
          score: 0.95,
          createdAt: new Date().toISOString(),
        },
      ],
      totalCount: 1,
      took: 25,
      query: body.query,
    })
  }),

  // Users
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        groups: ['engineering'],
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ])
  }),
]
