'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWebSocketManager, queryKeys } from '@/lib/api'
import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
  TraceSpansResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'
import {
  defaultTraceFilters,
  getServerStatusRepository,
  type TraceFilters,
} from '@/lib/repositories/server-status'

const serverStatusRepository = getServerStatusRepository()

export function useServerHealth() {
  return useQuery<HealthCheck>({
    queryKey: queryKeys.serverStatus.health(),
    queryFn: () => serverStatusRepository.getHealth(),
    refetchInterval: 5000,
  })
}

export function useServerLatency() {
  return useQuery<LatencyResponse>({
    queryKey: queryKeys.serverStatus.latency(),
    queryFn: () => serverStatusRepository.getLatency(),
    refetchInterval: 5000,
  })
}

export function useServiceUsage() {
  return useQuery<ServiceUsage[]>({
    queryKey: queryKeys.serverStatus.services(),
    queryFn: () => serverStatusRepository.getServiceUsage(),
    refetchInterval: 30000,
  })
}

export function useServerErrors() {
  return useQuery<ErrorLog[]>({
    queryKey: queryKeys.serverStatus.errors(),
    queryFn: () => serverStatusRepository.getErrorLogs(),
    refetchInterval: 10000,
  })
}

export function useRecentTraces(filters: Partial<TraceFilters> = {}) {
  const resolvedFilters: TraceFilters = {
    ...defaultTraceFilters,
    ...filters,
  }

  return useQuery<TraceSummary[]>({
    queryKey: queryKeys.serverStatus.traces(resolvedFilters),
    queryFn: () => serverStatusRepository.getRecentTraces(resolvedFilters),
    refetchInterval: 10000,
  })
}

export function useTraceSpans(traceId: string | null) {
  return useQuery<TraceSpansResponse>({
    queryKey: queryKeys.serverStatus.traceSpans(traceId ?? ''),
    queryFn: () => serverStatusRepository.getTraceSpans(traceId ?? ''),
    enabled: Boolean(traceId),
    staleTime: 30000,
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
