import type { ComponentType, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button, IconButton } from '@/components/ui/button'

describe('Button primitives', () => {
  it('defaults to square shape', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'data-shape',
      'square'
    )
  })

  it('renders circle shape for icon button sizes', () => {
    render(
      <IconButton aria-label="Refresh" shape="circle" size="icon-sm">
        <svg aria-hidden="true" />
      </IconButton>
    )

    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute(
      'data-shape',
      'circle'
    )
  })

  it('falls back to square shape and warns for non-icon circle size', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const UnsafeButton = Button as unknown as ComponentType<{
      children: ReactNode
      shape?: string
    }>

    render(<UnsafeButton shape="circle">Invalid</UnsafeButton>)

    expect(screen.getByRole('button', { name: 'Invalid' })).toHaveAttribute(
      'data-shape',
      'square'
    )
    expect(warnSpy).toHaveBeenCalledWith(
      '[Button] `shape="circle"` only supports icon sizes (`icon`, `icon-xs`, `icon-sm`, `icon-lg`). Falling back to `shape="square"`.'
    )

    warnSpy.mockRestore()
  })

  it('warns when IconButton is missing an accessible name at runtime', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const UnsafeIconButton = IconButton as unknown as ComponentType<{
      children: ReactNode
    }>

    render(
      <UnsafeIconButton>
        <svg aria-hidden="true" />
      </UnsafeIconButton>
    )

    expect(warnSpy).toHaveBeenCalledWith(
      '[IconButton] Missing accessible name. Provide `aria-label` or `aria-labelledby`.'
    )

    warnSpy.mockRestore()
  })

  it('does not warn when IconButton has an aria-label', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <IconButton aria-label="Open menu">
        <svg aria-hidden="true" />
      </IconButton>
    )

    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})
