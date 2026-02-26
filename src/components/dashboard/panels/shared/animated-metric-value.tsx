'use client'

import * as React from 'react'
import NumberFlow, { useCanAnimate } from '@number-flow/react'
import type { Format } from '@number-flow/react'
import { cn } from '@/lib/utils'

export type MetricValueAnimationMode = 'on-mount' | 'always' | 'never'

export interface AnimatedMetricValueProps {
  value: number | string
  format?: Format
  suffix?: string
  animationMode?: MetricValueAnimationMode
  delayMs?: number
  className?: string
}

function isFiniteNumber(value: number | string): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatStaticValue(
  value: number | string,
  format: Format | undefined,
  suffix: string | undefined
) {
  if (typeof value !== 'number') {
    return value
  }

  const formattedValue = new Intl.NumberFormat(undefined, format).format(value)
  return `${formattedValue}${suffix ?? ''}`
}

export function AnimatedMetricValue({
  value,
  format,
  suffix,
  animationMode = 'on-mount',
  delayMs = 0,
  className,
}: AnimatedMetricValueProps) {
  const canAnimate = useCanAnimate({ respectMotionPreference: true })
  const numericValue = isFiniteNumber(value)
  const shouldUseAnimatedPath = numericValue && canAnimate && animationMode !== 'never'

  const [displayValue, setDisplayValue] = React.useState<number | string>(() =>
    shouldUseAnimatedPath ? 0 : value
  )
  const [animated, setAnimated] = React.useState<boolean>(shouldUseAnimatedPath)
  const hasStartedMountAnimationRef = React.useRef(false)

  React.useEffect(() => {
    if (!numericValue) {
      setDisplayValue(value)
      setAnimated(false)
      return
    }

    if (!canAnimate || animationMode === 'never') {
      setDisplayValue(value)
      setAnimated(false)
      return
    }

    if (animationMode === 'always') {
      setAnimated(true)
      if (hasStartedMountAnimationRef.current) {
        setDisplayValue(value)
        return
      }

      const mountAnimationTimeoutId = window.setTimeout(() => {
        setDisplayValue(value)
        hasStartedMountAnimationRef.current = true
      }, delayMs)

      return () => {
        window.clearTimeout(mountAnimationTimeoutId)
      }
    }

    if (hasStartedMountAnimationRef.current) {
      setDisplayValue(value)
      return
    }

    setAnimated(true)
    const mountAnimationTimeoutId = window.setTimeout(() => {
      setDisplayValue(value)
      hasStartedMountAnimationRef.current = true
    }, delayMs)

    return () => {
      window.clearTimeout(mountAnimationTimeoutId)
    }
  }, [animationMode, canAnimate, delayMs, numericValue, value])

  const handleAnimationsFinish = React.useCallback(() => {
    if (animationMode === 'on-mount') {
      setAnimated(false)
    }
  }, [animationMode])

  if (!shouldUseAnimatedPath) {
    return (
      <span className={cn('[font-variant-numeric:tabular-nums]', className)}>
        {formatStaticValue(value, format, suffix)}
      </span>
    )
  }

  return (
    <NumberFlow
      value={displayValue as number}
      format={format}
      suffix={suffix}
      animated={animated}
      respectMotionPreference
      onAnimationsFinish={handleAnimationsFinish}
      className={cn('[font-variant-numeric:tabular-nums]', className)}
    />
  )
}
