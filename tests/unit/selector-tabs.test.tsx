import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  SelectorTabs,
  SelectorTabsContent,
  SelectorTabsList,
  SelectorTabsTrigger,
} from '@/components/ui/selector-tabs'

function ControlledSelectorTabsDemo() {
  const [value, setValue] = useState('first')

  return (
    <SelectorTabs value={value} onValueChange={setValue}>
      <SelectorTabsList aria-label="Demo selector tabs">
        <SelectorTabsTrigger value="first">First</SelectorTabsTrigger>
        <SelectorTabsTrigger value="second">Second</SelectorTabsTrigger>
      </SelectorTabsList>
      <SelectorTabsContent value="first">First panel</SelectorTabsContent>
      <SelectorTabsContent value="second">Second panel</SelectorTabsContent>
    </SelectorTabs>
  )
}

describe('SelectorTabs', () => {
  it('renders semantic tab roles', () => {
    render(
      <SelectorTabs defaultValue="first">
        <SelectorTabsList aria-label="Demo selector tabs">
          <SelectorTabsTrigger value="first">First</SelectorTabsTrigger>
          <SelectorTabsTrigger value="second">Second</SelectorTabsTrigger>
        </SelectorTabsList>
      </SelectorTabs>
    )

    expect(screen.getByRole('tablist', { name: 'Demo selector tabs' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument()
  })

  it('supports controlled active state switching', () => {
    render(<ControlledSelectorTabsDemo />)

    const firstTab = screen.getByRole('tab', { name: 'First' })
    const secondTab = screen.getByRole('tab', { name: 'Second' })

    expect(firstTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('First panel')).toBeVisible()

    fireEvent.mouseDown(secondTab, { button: 0 })

    expect(secondTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Second panel')).toBeVisible()
  })

  it('supports uncontrolled active state switching', () => {
    render(
      <SelectorTabs defaultValue="first">
        <SelectorTabsList aria-label="Uncontrolled selector tabs">
          <SelectorTabsTrigger value="first">First</SelectorTabsTrigger>
          <SelectorTabsTrigger value="second">Second</SelectorTabsTrigger>
        </SelectorTabsList>
      </SelectorTabs>
    )

    const secondTab = screen.getByRole('tab', { name: 'Second' })
    fireEvent.mouseDown(secondTab, { button: 0 })

    expect(secondTab).toHaveAttribute('aria-selected', 'true')
  })

  it('applies compact workspace-style width and allows className extension', () => {
    render(
      <SelectorTabs defaultValue="first">
        <SelectorTabsList aria-label="Styled selector tabs" className="custom-list-class">
          <SelectorTabsTrigger value="first" className="custom-trigger-class">
            First
          </SelectorTabsTrigger>
          <SelectorTabsTrigger value="second">Second</SelectorTabsTrigger>
        </SelectorTabsList>
      </SelectorTabs>
    )

    expect(screen.getByRole('tablist', { name: 'Styled selector tabs' })).toHaveClass('w-fit')
    expect(screen.getByRole('tablist', { name: 'Styled selector tabs' })).toHaveClass(
      'custom-list-class'
    )
    expect(screen.getByRole('tab', { name: 'First' })).toHaveClass('custom-trigger-class')
  })
})
