'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const DEFAULT_SHEET_EXIT_DELAY_MS = 200

interface UseDelayedSheetSelectionOptions {
  exitDelayMs?: number
}

interface UseDelayedSheetSelectionResult<T> {
  open: boolean
  selectedValue: T | null
  selectValue: (value: T) => void
  onOpenChange: (open: boolean) => void
  close: () => void
  clearImmediately: () => void
}

export function useDelayedSheetSelection<T>(
  options: UseDelayedSheetSelectionOptions = {}
): UseDelayedSheetSelectionResult<T> {
  const { exitDelayMs = DEFAULT_SHEET_EXIT_DELAY_MS } = options
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<T | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingTimer = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }
  }, [])

  const selectValue = useCallback(
    (value: T) => {
      clearPendingTimer()
      setSelectedValue(value)
      setOpen(true)
    },
    [clearPendingTimer]
  )

  const close = useCallback(() => {
    clearPendingTimer()
    setOpen(false)
    clearTimerRef.current = setTimeout(() => {
      setSelectedValue(null)
      clearTimerRef.current = null
    }, exitDelayMs)
  }, [clearPendingTimer, exitDelayMs])

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        clearPendingTimer()
        if (selectedValue !== null) {
          setOpen(true)
        }
        return
      }
      close()
    },
    [clearPendingTimer, close, selectedValue]
  )

  const clearImmediately = useCallback(() => {
    clearPendingTimer()
    setOpen(false)
    setSelectedValue(null)
  }, [clearPendingTimer])

  useEffect(() => {
    return () => {
      clearPendingTimer()
    }
  }, [clearPendingTimer])

  return {
    open,
    selectedValue,
    selectValue,
    onOpenChange,
    close,
    clearImmediately,
  }
}
