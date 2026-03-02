'use client'

import * as React from 'react'
import {
  SERVICE_MODE_STORAGE_KEY,
  isServiceMode,
  type ServiceMode,
} from '@/lib/preferences/service-mode'

function persistServiceMode(serviceMode: ServiceMode, storageKey: string) {
  localStorage.setItem(storageKey, serviceMode)
}

function readStoredServiceMode(storageKey: string): ServiceMode | null {
  const value = localStorage.getItem(storageKey)
  return isServiceMode(value) ? value : null
}

interface ServiceModeProviderProps {
  children: React.ReactNode
  defaultServiceMode?: ServiceMode
  storageKey?: string
}

interface ServiceModeProviderState {
  serviceMode: ServiceMode
  setServiceMode: (serviceMode: ServiceMode) => void
}

const ServiceModeProviderContext = React.createContext<ServiceModeProviderState | undefined>(
  undefined
)

export function ServiceModeProvider({
  children,
  defaultServiceMode = 'simple',
  storageKey = SERVICE_MODE_STORAGE_KEY,
}: ServiceModeProviderProps) {
  const [serviceMode, setServiceModeState] =
    React.useState<ServiceMode>(defaultServiceMode)

  React.useEffect(() => {
    const storedServiceMode = readStoredServiceMode(storageKey)
    if (!storedServiceMode || storedServiceMode === serviceMode) {
      return
    }

    setServiceModeState(storedServiceMode)
  }, [serviceMode, storageKey])

  const setServiceMode = React.useCallback(
    (nextServiceMode: ServiceMode) => {
      persistServiceMode(nextServiceMode, storageKey)
      setServiceModeState(nextServiceMode)
    },
    [storageKey]
  )

  React.useEffect(() => {
    let active = true

    fetch('/api/preferences')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active || !isServiceMode(data?.service_mode)) {
          return
        }

        const hasStoredPreference = readStoredServiceMode(storageKey) !== null
        if (hasStoredPreference) {
          return
        }

        persistServiceMode(data.service_mode, storageKey)
        setServiceModeState(data.service_mode)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [storageKey])

  const value = React.useMemo(
    () => ({
      serviceMode,
      setServiceMode,
    }),
    [serviceMode, setServiceMode]
  )

  return (
    <ServiceModeProviderContext.Provider value={value}>
      {children}
    </ServiceModeProviderContext.Provider>
  )
}

export function useServiceMode() {
  const context = React.useContext(ServiceModeProviderContext)
  if (context === undefined) {
    throw new Error('useServiceMode must be used within a ServiceModeProvider')
  }

  return context
}
