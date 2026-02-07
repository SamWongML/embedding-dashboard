'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ApiState } from '@/lib/api'
import { getWebSocketManager, queryKeys, resolveApiState } from '@/lib/api'
import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
} from '@/lib/schemas/server-status'
import {
  fetchServerErrors,
  fetchServerHealth,
  fetchServerLatency,
  fetchServiceUsage,
} from '@/lib/repositories/server-status/api'
import {
  getMockErrors,
  getMockHealthCheck,
  getMockLatencyResponse,
  mockServices,
} from '@/lib/repositories/server-status/mock'

export function useServerHealth() {
  return useQuery<ApiState<HealthCheck>>({
    queryKey: queryKeys.serverStatus.health(),
    queryFn: () => resolveApiState(fetchServerHealth, getMockHealthCheck),
    refetchInterval: 5000,
  })
}

export function useServerLatency() {
  return useQuery<ApiState<LatencyResponse>>({
    queryKey: queryKeys.serverStatus.latency(),
    queryFn: () => resolveApiState(fetchServerLatency, getMockLatencyResponse),
    refetchInterval: 5000,
  })
}

export function useServiceUsage() {
  return useQuery<ApiState<ServiceUsage[]>>({
    queryKey: queryKeys.serverStatus.services(),
    queryFn: () => resolveApiState(fetchServiceUsage, () => mockServices),
    refetchInterval: 30000,
  })
}

export function useServerErrors() {
  return useQuery<ApiState<ErrorLog[]>>({
    queryKey: queryKeys.serverStatus.errors(),
    queryFn: () => resolveApiState(fetchServerErrors, getMockErrors),
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
