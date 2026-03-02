import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageContentShell } from '@/components/layout/page-content-shell'

describe('PageContentShell', () => {
  it('applies tokenized page shell spacing by default', () => {
    const { container } = render(
      <PageContentShell>
        <div>Content</div>
      </PageContentShell>
    )

    const shell = container.querySelector('[data-slot="page-content-shell"]')
    expect(shell).not.toBeNull()
    if (!shell) return

    expect(shell).toHaveClass('shrink-0')
    expect(shell).toHaveClass('px-(--space-page-inline)')
    expect(shell).toHaveClass('pt-(--space-page-top)')
    expect(shell).toHaveClass('pb-(--space-page-shell-padding-bottom)')
    expect(shell).not.toHaveClass('pt-0')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('supports topInset="none" and preserves safe page-foot spacing', () => {
    const { container } = render(
      <PageContentShell topInset="none">
        <div>Content</div>
      </PageContentShell>
    )

    const shell = container.querySelector('[data-slot="page-content-shell"]')
    expect(shell).not.toBeNull()
    if (!shell) return

    expect(shell).toHaveClass('shrink-0')
    expect(shell).toHaveClass('pt-0')
    expect(shell).not.toHaveClass('pt-(--space-page-top)')
    expect(shell).toHaveClass('pb-(--space-page-shell-padding-bottom)')
  })
})
