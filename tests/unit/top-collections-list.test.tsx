import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopCollectionsList } from '@/components/dashboard/panels/metrics/top-collections-list'

describe('TopCollectionsList', () => {
  it('renders ranked collection rows with share values and rails', () => {
    const { container } = render(
      <TopCollectionsList
        collections={[
          {
            id: 'support',
            name: 'Support Routing Manual',
            collectionName: 'Support',
            requestCount: 18440,
            contentType: 'text',
          },
          {
            id: 'search',
            name: 'Semantic Search Guide',
            collectionName: 'Search',
            requestCount: 6820,
            contentType: 'image',
          },
        ]}
      />
    )

    expect(screen.getByRole('list', { name: 'Most accessed collections' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Support Routing Manual')).toBeVisible()
    expect(screen.getByText('Semantic Search Guide')).toBeVisible()
    expect(screen.getByText('Support')).toBeVisible()
    expect(screen.getByText('Search')).toBeVisible()
    expect(screen.getByText('73%')).toBeVisible()
    expect(screen.getByText('27%')).toBeVisible()

    const railFills = container.querySelectorAll('[data-slot="top-collections-rail-fill"]')
    expect(railFills).toHaveLength(2)
    expect(railFills[0]).toHaveStyle({ width: '100%' })
  })

  it('renders empty state when no collections are provided', () => {
    render(<TopCollectionsList collections={[]} />)

    expect(screen.getByText('No collection activity yet.')).toBeVisible()
  })
})
