export interface VectorMagnitudeBin {
  index: number
  value: number
}

export function formatVectorPreview(vector: number[], previewLength = 8) {
  return vector.slice(0, previewLength).map((value) => {
    if (!Number.isFinite(value)) {
      return '0.0000'
    }
    return value.toFixed(4)
  })
}

export function createVectorMagnitudeBins(
  vector: number[],
  targetBinCount = 32
): VectorMagnitudeBin[] {
  if (vector.length === 0) {
    return []
  }

  const binCount = Math.max(1, Math.min(targetBinCount, vector.length))
  const sums = Array.from({ length: binCount }, () => 0)
  const counts = Array.from({ length: binCount }, () => 0)

  vector.forEach((value, index) => {
    const binIndex = Math.min(
      binCount - 1,
      Math.floor((index / vector.length) * binCount)
    )
    sums[binIndex] += Math.abs(value)
    counts[binIndex] += 1
  })

  const averages = sums.map((sum, index) =>
    counts[index] === 0 ? 0 : sum / counts[index]
  )
  const maxValue = Math.max(...averages)

  return averages.map((value, index) => ({
    index,
    value: maxValue === 0 ? 0 : Math.round((value / maxValue) * 100),
  }))
}

export function formatProcessingDuration(processingTime?: number) {
  if (!processingTime || !Number.isFinite(processingTime) || processingTime <= 0) {
    return '—'
  }

  if (processingTime < 10_000) {
    return `~${(processingTime / 1000).toFixed(1)}s`
  }

  if (processingTime < 60_000) {
    return `~${Math.round(processingTime / 1000)}s`
  }

  return `~${(processingTime / 60_000).toFixed(1)}m`
}
