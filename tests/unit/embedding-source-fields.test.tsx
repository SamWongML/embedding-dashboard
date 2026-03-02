import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { EmbeddingSourceFields } from '@/components/dashboard/panels/text-embedding/embedding-source-fields'

function renderSourceFields(
  overrides: Partial<ComponentProps<typeof EmbeddingSourceFields>> = {}
) {
  const onSourceTypeChange = overrides.onSourceTypeChange ?? vi.fn()

  render(
    <EmbeddingSourceFields
      sourceType={overrides.sourceType ?? 'text'}
      onSourceTypeChange={onSourceTypeChange}
      textValue={overrides.textValue ?? ''}
      onTextValueChange={overrides.onTextValueChange ?? vi.fn()}
      urlValue={overrides.urlValue ?? ''}
      onUrlValueChange={overrides.onUrlValueChange ?? vi.fn()}
      textError={overrides.textError}
      urlError={overrides.urlError}
      disabled={overrides.disabled}
      textPlaceholder={overrides.textPlaceholder}
      urlPlaceholder={overrides.urlPlaceholder}
    />
  )

  return { onSourceTypeChange }
}

describe('EmbeddingSourceFields', () => {
  it('renders source type tabs with expected names', () => {
    renderSourceFields()

    expect(screen.getByRole('tab', { name: 'Direct Text' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'URL Content' })).toBeInTheDocument()
  })

  it('calls onSourceTypeChange with "url" when URL Content is selected', () => {
    const { onSourceTypeChange } = renderSourceFields({ sourceType: 'text' })

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'URL Content' }), {
      button: 0,
    })

    expect(onSourceTypeChange).toHaveBeenCalledWith('url')
  })

  it('calls onSourceTypeChange with "text" when Direct Text is selected', () => {
    const { onSourceTypeChange } = renderSourceFields({ sourceType: 'url' })

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Direct Text' }), {
      button: 0,
    })

    expect(onSourceTypeChange).toHaveBeenCalledWith('text')
  })

  it('disables both source tabs when disabled=true', () => {
    const { onSourceTypeChange } = renderSourceFields({ disabled: true })

    const directTextTab = screen.getByRole('tab', { name: 'Direct Text' })
    const urlContentTab = screen.getByRole('tab', { name: 'URL Content' })

    expect(directTextTab).toBeDisabled()
    expect(urlContentTab).toBeDisabled()

    fireEvent.click(urlContentTab)
    expect(onSourceTypeChange).not.toHaveBeenCalled()
  })

  it('does not render inline icons inside source tabs', () => {
    renderSourceFields()

    const directTextTab = screen.getByRole('tab', { name: 'Direct Text' })
    const urlContentTab = screen.getByRole('tab', { name: 'URL Content' })

    expect(directTextTab.querySelector('svg')).toBeNull()
    expect(urlContentTab.querySelector('svg')).toBeNull()
  })
})
