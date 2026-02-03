'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api, queryKeys, getWebSocketManager } from '@/lib/api'
import {
  type HealthCheck,
  type LatencyResponse,
  type ServiceUsage,
  type ErrorLog,
  healthCheckSchema,
  latencyResponseSchema,
} from '@/lib/schemas/server-status'

// Mock data for development
const mockHealthCheck: HealthCheck = {
  status: 'healthy',
  uptime: 864000,
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}

const mockLatencyResponse: LatencyResponse = {
  current: 45,
  average: 52,
  p95: 89,
  p99: 120,
  history: Array.from({ length: 60 }, (_, i) => ({
    timestamp: new Date(Date.now() - (60 - i) * 60000).toISOString(), // 1 minute intervals
    value: Math.floor(Math.random() * 50) + 30,
  })),
}

const mockServices: ServiceUsage[] = [
  { endpoint: '/api/embed/text', method: 'POST', count: 15420, avgLatency: 45 },
  { endpoint: '/api/embed/image', method: 'POST', count: 8320, avgLatency: 120 },
  { endpoint: '/api/search', method: 'POST', count: 25600, avgLatency: 32 },
  { endpoint: '/api/records', method: 'GET', count: 12400, avgLatency: 18 },
  { endpoint: '/api/graph/nodes', method: 'GET', count: 3200, avgLatency: 85 },
]

const mockErrors: ErrorLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'error',
    message: 'Connection timeout to embedding service',
    source: 'embedding-service',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'warning',
    message: 'High memory usage detected (85%)',
    source: 'system-monitor',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'info',
    message: 'Rate limit threshold reached for user xyz',
    source: 'rate-limiter',
  },
]

export function useServerHealth() {
  return useQuery({
    queryKey: queryKeys.serverStatus.health(),
    queryFn: async () => {
      try {
        return await api.get('/health', healthCheckSchema)
      } catch {
        // Return mock data if API is unavailable
        return mockHealthCheck
      }
    },
    refetchInterval: 5000,
  })
}

export function useServerLatency() {
  return useQuery({
    queryKey: queryKeys.serverStatus.latency(),
    queryFn: async () => {
      try {
        return await api.get('/metrics/latency', latencyResponseSchema)
      } catch {
        return mockLatencyResponse
      }
    },
    refetchInterval: 5000,
  })
}

export function useServiceUsage() {
  return useQuery({
    queryKey: queryKeys.serverStatus.services(),
    queryFn: async () => {
      try {
        return await api.get<ServiceUsage[]>('/metrics/services')
      } catch {
        return mockServices
      }
    },
    refetchInterval: 30000,
  })
}

export function useServerErrors() {
  return useQuery({
    queryKey: queryKeys.serverStatus.errors(),
    queryFn: async () => {
      try {
        return await api.get<ErrorLog[]>('/logs/errors')
      } catch {
        return mockErrors
      }
    },
    refetchInterval: 10000,
  })
}

export function useRealtimeLatency() {
  const [latency, setLatency] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ws = getWebSocketManager()
    ws.connect()

    const unsubscribeLatency = ws.subscribe('latency', (data) => {
      if (typeof data === 'object' && data !== null && 'value' in data) {
        setLatency((data as { value: number }).value)
      }
    })

    const unsubscribeConnect = ws.onConnect(() => setIsConnected(true))
    const unsubscribeDisconnect = ws.onDisconnect(() => setIsConnected(false))

    return () => {
      unsubscribeLatency()
      unsubscribeConnect()
      unsubscribeDisconnect()
    }
  }, [])

  return { latency, isConnected }
}
