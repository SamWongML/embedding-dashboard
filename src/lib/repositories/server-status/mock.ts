import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
} from "@/lib/schemas/server-status"

export function getMockHealthCheck(): HealthCheck {
  return {
    status: "healthy",
    uptime: 864000,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  }
}

export function getMockLatencyResponse(): LatencyResponse {
  return {
    current: 45,
    average: 52,
    p95: 89,
    p99: 120,
    history: Array.from({ length: 60 }, (_, index) => ({
      timestamp: new Date(Date.now() - (60 - index) * 60_000).toISOString(),
      value: Math.floor(Math.random() * 50) + 30,
    })),
  }
}

export const mockServices: ServiceUsage[] = [
  { endpoint: "/api/embed/text", method: "POST", count: 15420, avgLatency: 45 },
  { endpoint: "/api/embed/image", method: "POST", count: 8320, avgLatency: 120 },
  { endpoint: "/api/search", method: "POST", count: 25600, avgLatency: 32 },
  { endpoint: "/api/records", method: "GET", count: 12400, avgLatency: 18 },
  { endpoint: "/api/graph/nodes", method: "GET", count: 3200, avgLatency: 85 },
]

export function getMockErrors(): ErrorLog[] {
  return [
    {
      id: "1",
      timestamp: new Date(Date.now() - 300_000).toISOString(),
      level: "error",
      message: "Connection timeout to embedding service",
      source: "embedding-service",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 600_000).toISOString(),
      level: "warning",
      message: "High memory usage detected (85%)",
      source: "system-monitor",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 900_000).toISOString(),
      level: "info",
      message: "Rate limit threshold reached for user xyz",
      source: "rate-limiter",
    },
  ]
}
