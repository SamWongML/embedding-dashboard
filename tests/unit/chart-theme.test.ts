import { describe, expect, it } from 'vitest'
import {
  chartBarFill,
  chartToneToColorVar,
  colorByGraphNodeType,
  graphNodeColorByType,
} from '@/components/charts/chart-theme'

describe('chart-theme', () => {
  it('maps each chart tone to the expected token variable', () => {
    expect(chartToneToColorVar).toMatchObject({
      accent: 'var(--chart-accent)',
      accentSoft: 'var(--chart-accent-soft)',
      accentDim: 'var(--chart-accent-dim)',
      teal: 'var(--chart-2)',
      amber: 'var(--chart-3)',
      green: 'var(--chart-4)',
      coral: 'var(--chart-5)',
      muted: 'var(--chart-axis)',
      success: 'var(--success)',
      warning: 'var(--warning)',
      error: 'var(--error)',
    })
  })

  it('uses a single accent token for ranking bar fills', () => {
    expect(chartBarFill).toBe('var(--chart-accent)')
  })

  it('maps graph node types to allowed chart tokens only', () => {
    const allowedValues = new Set(Object.values(chartToneToColorVar))

    Object.values(graphNodeColorByType).forEach((color) => {
      expect(allowedValues.has(color)).toBe(true)
    })

    expect(colorByGraphNodeType('document')).toBe('var(--chart-accent)')
    expect(colorByGraphNodeType('topic')).toBe('var(--chart-2)')
    expect(colorByGraphNodeType('user-group')).toBe('var(--chart-3)')
    expect(colorByGraphNodeType('unknown-node-type')).toBe('var(--chart-axis)')
  })
})
