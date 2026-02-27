"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

interface DashboardPageHeaderContextValue {
  actions: ReactNode | null
  setActions: (actions: ReactNode | null) => void
}

const DashboardPageHeaderContext =
  createContext<DashboardPageHeaderContextValue | null>(null)

export function DashboardPageHeaderProvider({
  children,
}: {
  children: ReactNode
}) {
  const [actions, setActions] = useState<ReactNode | null>(null)

  const value = useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions]
  )

  return (
    <DashboardPageHeaderContext.Provider value={value}>
      {children}
    </DashboardPageHeaderContext.Provider>
  )
}

export function useDashboardPageHeaderState() {
  const context = useContext(DashboardPageHeaderContext)
  if (!context) {
    throw new Error(
      "useDashboardPageHeaderState must be used within DashboardPageHeaderProvider."
    )
  }

  return {
    actions: context.actions,
  }
}

export function useDashboardPageHeaderActions(actions: ReactNode | null) {
  const context = useContext(DashboardPageHeaderContext)
  if (!context) {
    throw new Error(
      "useDashboardPageHeaderActions must be used within DashboardPageHeaderProvider."
    )
  }

  const { setActions } = context

  useEffect(() => {
    setActions(actions ?? null)
  }, [actions, setActions])

  useEffect(
    () => () => {
      setActions(null)
    },
    [setActions]
  )
}
