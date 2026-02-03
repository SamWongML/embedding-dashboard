import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HealthIndicator } from '@/components/dashboard/panels/server-status/health-indicator'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('HealthIndicator', () => {
  it('renders healthy status correctly', () => {
    render(<HealthIndicator status="healthy" />, { wrapper: createWrapper() })
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders degraded status correctly', () => {
    render(<HealthIndicator status="degraded" />, { wrapper: createWrapper() })
    expect(screen.getByText('Degraded')).toBeInTheDocument()
  })

  it('renders unhealthy status correctly', () => {
    render(<HealthIndicator status="unhealthy" />, { wrapper: createWrapper() })
    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
  })

  it('renders custom label when provided', () => {
    render(
      <HealthIndicator status="healthy" label="Custom Label" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText('Custom Label')).toBeInTheDocument()
  })
})
