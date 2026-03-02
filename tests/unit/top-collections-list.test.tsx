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

    const rows = screen.getAllByRole('listitem')
    expect(screen.getByRole('list', { name: 'Most accessed collections' })).toBeInTheDocument()
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('1')
    expect(rows[0]).toHaveTextContent('Support Routing Manual')
    expect(rows[0]).toHaveTextContent('Support')
    expect(rows[0]).toHaveTextContent('18.4k')
    expect(rows[1]).toHaveTextContent('2')
    expect(rows[1]).toHaveTextContent('Semantic Search Guide')
    expect(rows[1]).toHaveTextContent('Search')
    expect(rows[1]).toHaveTextContent('6.8k')
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
