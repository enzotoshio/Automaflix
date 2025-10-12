import { SearchProvider } from '@/contexts/search/provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from './test-utils'

// Simpler wrapper for components that don't need routing
function TestProviders({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient?: QueryClient
}) {
  const client = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={client}>
      <SearchProvider>{children}</SearchProvider>
    </QueryClientProvider>
  )
}

export default TestProviders
